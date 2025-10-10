package com.example.deviceservice.service;

import com.example.deviceservice.dto.DeviceDTO;
import com.example.deviceservice.dto.DeviceDetailsDTO;
import com.example.deviceservice.events.DeviceStatusChangedEvent;
import com.example.deviceservice.model.AuditLog;
import com.example.deviceservice.model.Device;
import com.example.deviceservice.model.Owner;
import com.example.deviceservice.model.StatusTracker;
import com.example.deviceservice.repository.AuditLogRepository;
import com.example.deviceservice.repository.DeviceRepository;
import com.example.deviceservice.repository.OwnerRepository;
import com.example.deviceservice.repository.StatusTrackerRepository;
import com.example.deviceservice.util.CSVExportException;
import com.example.deviceservice.util.DeviceNotFoundException;
import com.example.deviceservice.util.InvalidDeviceOperationException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.deviceservice.mapper.DeviceMapper;

import java.io.File;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;

@Service
public class DeviceServiceImpl implements DeviceService {

    private static final Logger logger = LogManager.getLogger(DeviceServiceImpl.class);
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";
    private static final String DEVICE_ID_PREFIX = "TEL";
    private static final String CSV_DIRECTORY = "shared";
    private static final String DEVICE_CSV_FILE = CSV_DIRECTORY + "/device.csv";
    private static final String OWNER_CSV_FILE = CSV_DIRECTORY + "/owner.csv";
    private static final String STATUS_TRACKER_CSV_FILE = CSV_DIRECTORY + "/status_tracker.csv";

    @Autowired
    public DeviceServiceImpl(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    private final MeterRegistry meterRegistry;

    @Autowired
    private DeviceRepository deviceRepo;

    @Autowired
    private AuditService auditService;

    @Autowired
    private StatusTrackerRepository statusTrackerRepo;

    @Autowired
    private OwnerRepository ownerRepo;

    @Autowired
    private AuditLogRepository auditRepo;

    @Autowired
    private NotificationService notificationService;

    private Device getDeviceOrThrow(String deviceID) {
        return deviceRepo.findById(deviceID)
                .orElseThrow(() -> {
                    logger.error("Device not found for ID: {}", deviceID);
                    throw new DeviceNotFoundException(deviceID);
                });
    }

    @Transactional
    @Override
    public DeviceDTO registerDevice(DeviceDTO dto) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry);

        String deviceID = generateUniqueDeviceID();
        logger.info("Registering new device with data: {}", deviceID);
        LocalDate now = LocalDate.now();
        boolean isSoftDeleted = STATUS_INACTIVE.equalsIgnoreCase(dto.getStatus());

        Device device = DeviceMapper.toEntity(dto);
        device.setDeviceID(deviceID);
        device.setCreatedOn(now);
        device.setLastUpdate(now);
        device.setOwnerID(null);
        device.setSoftDeleted(isSoftDeleted);
        device.setDeletedOn(null);

        deviceRepo.save(device);
        logger.debug("Device saved: {}", device);

        auditService.log(deviceID, "Device registered");
        logStatusChange(deviceID, null, dto.getStatus(), "system", "Device registered");

        sample.stop(Timer.builder("device.service.register")
                .description("Time taken to register a device")
                .tag("operation", "register")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for registerDevice (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log

        return DeviceMapper.toDTO(device);
    }


    @Override
    public DeviceDTO updateDevice(String deviceID, DeviceDTO updatedDTO) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Updating device ID: {} with data: {}", deviceID, updatedDTO);
        Device device = getDeviceOrThrow(deviceID);

        if (updatedDTO.getName() != null) device.setName(updatedDTO.getName());
        if (updatedDTO.getType() != null) device.setType(updatedDTO.getType());
        if (updatedDTO.getManufacturer() != null) device.setManufacturer(updatedDTO.getManufacturer());
        if (updatedDTO.getPurchaseDate() != null) device.setPurchaseDate(updatedDTO.getPurchaseDate());
        if (updatedDTO.getOwnerID() != null) device.setOwnerID(updatedDTO.getOwnerID());

        if (updatedDTO.getStatus() != null && !updatedDTO.getStatus().equals(device.getStatus())) {
            String oldStatus = device.getStatus();
            logger.info("Status change detected for device ID: {} from {} to {}", deviceID, oldStatus, updatedDTO.getStatus());
            device.setStatus(updatedDTO.getStatus());

            if (STATUS_INACTIVE.equalsIgnoreCase(updatedDTO.getStatus())) {
                device.setSoftDeleted(true);
                device.setDeletedOn(LocalDate.now());
                device.setOwnerID(null);
            }

            logStatusChange(deviceID, oldStatus, updatedDTO.getStatus(),
                    "system", "Device updated via PATCH");
            logger.info("Publishing event for device: {}", deviceID);
        }

        if (updatedDTO.getDeletedOn() != null) device.setDeletedOn(updatedDTO.getDeletedOn());

        device.setLastUpdate(LocalDate.now());
        deviceRepo.save(device);
        logger.debug("Device updated: {}", device);

        auditService.log(deviceID, "Device updated via PATCH");

        sample.stop(Timer.builder("device.service.update")
                .description("Time taken to update a device")
                .tag("operation", "update")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for updateDevice (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log

        return DeviceMapper.toDTO(device);
    }


    @Override
    public void assignOwnerToDevice(String deviceID, String ownerID) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Assigning owner ID: {} to device ID: {}", ownerID, deviceID);
        Device device = getDeviceOrThrow(deviceID);

        if (STATUS_INACTIVE.equalsIgnoreCase(device.getStatus())) {
            logger.warn("Attempt to assign owner to inactive device ID: {}", deviceID);
            throw new InvalidDeviceOperationException(deviceID, "Device is inactive and cannot be assigned an owner.");
        }

        device.setOwnerID(ownerID);
        device.setLastUpdate(LocalDate.now());
        deviceRepo.save(device);
        logger.debug("Owner assigned and device updated: {}", device);

        auditService.log(deviceID, "Owner assigned: " + ownerID);

        sample.stop(Timer.builder("device.service.assignOwner")
                .description("Time taken to assign owner to device")
                .tag("operation", "assignOwner")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for assignOwnerToDevice (deviceID={}, ownerID={}): {} ms", deviceID, ownerID, duration); // ✅ Splunk-friendly log
    }


    @Override
    public void softDeleteDevice(String deviceID) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Soft deleting device ID: {}", deviceID);
        Device device = getDeviceOrThrow(deviceID);

        if (device.isSoftDeleted()) {
            logger.warn("Device ID: {} is already soft deleted", deviceID);
            throw new InvalidDeviceOperationException(deviceID, "Device is already soft deleted.");
        }

        String oldStatus = device.getStatus();
        device.setSoftDeleted(true);
        device.setDeletedOn(LocalDate.now());
        device.setStatus(STATUS_INACTIVE);
        device.setOwnerID(null);

        deviceRepo.save(device);
        logger.debug("Device soft deleted: {}", device);

        auditService.log(deviceID, "Device soft deleted, status set to inactive, and owner removed");
        logStatusChange(deviceID, oldStatus, "inactive", "system", "Device soft deleted");

        sample.stop(Timer.builder("device.service.softDelete")
                .description("Time taken to soft delete a device")
                .tag("operation", "softDelete")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for softDeleteDevice (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log
    }


    @Override
    public void recoverDevice(String deviceID) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Recovering device ID: {}", deviceID);
        Device device = getDeviceOrThrow(deviceID);

        if (!device.isSoftDeleted()) {
            logger.warn("Device ID: {} is not soft deleted and cannot be recovered", deviceID);
            throw new InvalidDeviceOperationException(deviceID, "Device is not soft deleted and cannot be recovered.");
        }

        String oldStatus = device.getStatus();
        device.setSoftDeleted(false);
        device.setDeletedOn(null);
        device.setStatus(STATUS_ACTIVE);

        deviceRepo.save(device);
        logger.debug("Device recovered: {}", device);

        auditService.log(deviceID, "Device recovered and status set to active");
        logStatusChange(deviceID, oldStatus, "active", "system", "Device recovered");

        sample.stop(Timer.builder("device.service.recover")
                .description("Time taken to recover a device")
                .tag("operation", "recover")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for recoverDevice (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log
    }


    @Override
    public DeviceDetailsDTO getDeviceDetails(String deviceID) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Fetching details for device ID: {}", deviceID);
        Device device = getDeviceOrThrow(deviceID);

        auditService.log(deviceID, "Device searched");

        sample.stop(Timer.builder("device.service.getDetails")
                .description("Time taken to fetch device details")
                .tag("operation", "getDetails")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for getDeviceDetails (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log

        return new DeviceDetailsDTO(DeviceMapper.toDTO(device));
    }


    @Override
    public List<DeviceDetailsDTO> filterDevices(String deviceID, String type, String manufacturer, String ownerID,
                                                String status, LocalDate startDate, LocalDate endDate) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Filtering devices with deviceID: {}, type: {}, manufacturer: {}, ownerID: {}, status: {}, startDate: {}, endDate: {}",
                deviceID, type, manufacturer, ownerID, status, startDate, endDate);

        List<Device> devices = deviceRepo.filterDevices(deviceID, type, manufacturer, ownerID, status, startDate, endDate);

        List<DeviceDetailsDTO> result = new ArrayList<>();
        for (Device device : devices) {
            result.add(new DeviceDetailsDTO(DeviceMapper.toDTO(device)));
        }

        logger.debug("Filtered {} devices", result.size());

        sample.stop(Timer.builder("device.service.filter")
                .description("Time taken to filter devices")
                .tag("operation", "filter")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for filterDevices (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log

        return result;
    }



    @Override
    public List<DeviceDetailsDTO> getAllDevices(boolean includeDeleted) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Fetching all devices. Include deleted: {}", includeDeleted);
        List<Device> devices = includeDeleted ? deviceRepo.findAll() : deviceRepo.findBySoftDeletedFalse();

        List<DeviceDetailsDTO> result = devices.stream()
                .map(device -> new DeviceDetailsDTO(DeviceMapper.toDTO(device)))
                .toList();

        sample.stop(Timer.builder("device.service.getAll")
                .description("Time taken to fetch all devices")
                .tag("operation", "getAll")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for getAllDevices (includeDeleted={}): {} ms", includeDeleted, duration); // ✅ Splunk-friendly log

        return result;
    }


    @Override
    public List<String> getAuditLogs(String deviceID) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Fetching audit logs for device ID: {}", deviceID);
        List<String> logs = auditService.getLogsForDevice(deviceID)
                .stream()
                .map(log -> "[LogID: " + log.getLogId() + "] [DeviceID: " + deviceID + "] [" +
                        log.getTimestamp() + "] " + log.getAction())
                .toList();

        sample.stop(Timer.builder("device.service.auditLogs")
                .description("Time taken to fetch audit logs")
                .tag("operation", "getAuditLogs")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for getAuditLogs (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log

        return logs;
    }


    @Override
    public void exportDevicesToCSV() {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Exporting devices to CSV");
        List<Device> devices;

        try {
            devices = deviceRepo.findAll();
        } catch (Exception e) {
            logger.error("Failed to fetch devices for CSV export", e);
            throw new CSVExportException("Failed to fetch devices for CSV export", e);
        }

        File directory = new File(CSV_DIRECTORY);
        if (!directory.exists()) {
            directory.mkdirs();
            logger.debug("Created 'shared' directory for CSV export");
        }

        try (PrintWriter writer = new PrintWriter(DEVICE_CSV_FILE)) {
            writer.println("Device ID,Name,Type,Manufacturer,Purchase Date,Created On,Last Update,Owner ID,Status");
            for (Device d : devices) {
                writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                        d.getDeviceID(), d.getName(), d.getType(), d.getManufacturer(),
                        d.getPurchaseDate(), d.getCreatedOn(), d.getLastUpdate(),
                        d.getOwnerID(), d.getStatus());
            }
            logger.info("Device CSV exported successfully");
        } catch (Exception e) {
            logger.error("Failed to write device CSV", e);
            throw new CSVExportException("Failed to write device CSV", e);
        }

        sample.stop(Timer.builder("device.service.exportCSV")
                .description("Time taken to export devices to CSV")
                .tag("operation", "exportCSV")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for exportDevicesToCSV: {} ms", duration); // ✅ Splunk-friendly log
    }


    @Override
    public void exportStatusTrackerToCSV() {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Exporting status tracker to CSV");
        List<StatusTracker> trackers = statusTrackerRepo.findAll();

        try (PrintWriter writer = new PrintWriter(STATUS_TRACKER_CSV_FILE)) {
            writer.println("Device ID,Timestamp,Status");
            for (StatusTracker s : trackers) {
                writer.printf("%s,%s,%s%n", s.getDeviceID(), s.getTimestamp(), s.getStatus());
            }
            logger.info("Status tracker CSV exported successfully");
        } catch (Exception e) {
            logger.error("Failed to export status tracker CSV", e);
            throw new CSVExportException("Failed to export status tracker CSV", e);
        }

        sample.stop(Timer.builder("device.service.exportStatusTrackerCSV")
                .description("Time taken to export status tracker to CSV")
                .tag("operation", "exportStatusTrackerCSV")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for exportStatusTrackerToCSV: {} ms", duration); // ✅ Splunk-friendly log
    }


    @Override
    public void exportOwnersToCSV() {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        logger.info("Exporting owners to CSV");
        List<Owner> owners = ownerRepo.findAll();

        File directory = new File(CSV_DIRECTORY);
        if (!directory.exists()) {
            directory.mkdirs();
            logger.debug("Created 'shared' directory for owner CSV export");
        }

        try (PrintWriter writer = new PrintWriter(OWNER_CSV_FILE)) {
            writer.println("Owner ID,Contact Info,Name");
            for (Owner o : owners) {
                writer.printf("%s,%s,%s%n", o.getOwnerID(), o.getContactInfo(), o.getName());
            }
            logger.info("Owner CSV exported successfully");
        } catch (Exception e) {
            logger.error("Failed to export owner CSV", e);
            throw new CSVExportException("Failed to export owner CSV", e);
        }

        sample.stop(Timer.builder("device.service.exportOwnerCSV")
                .description("Time taken to export owners to CSV")
                .tag("operation", "exportOwnerCSV")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for exportOwnersToCSV: {} ms", duration); // ✅ Splunk-friendly log
    }


    private String generateUniqueDeviceID() {
        String id;
        do {
            id = DEVICE_ID_PREFIX + (new Random().nextInt(900000) + 100000);
        } while (deviceRepo.existsById(id));
        logger.debug("Generated unique device ID: {}", id);
        return id;
    }


    private void logStatusChange(String deviceID, String oldStatus, String newStatus,
                                 String changedBy, String reason) {
        long start = System.currentTimeMillis(); // Start time
        Timer.Sample sample = Timer.start(meterRegistry); // Micrometer timer

        StatusTracker tracker = new StatusTracker(deviceID, LocalDateTime.now(), newStatus);
        statusTrackerRepo.save(tracker);
        logger.debug("Logged status change for device ID: {} to status: {}", deviceID, newStatus);

        try {
            notificationService.handleDeviceStatusChanged(
                    new DeviceStatusChangedEvent(
                            deviceID,
                            oldStatus,
                            newStatus,
                            java.time.Instant.now(),
                            changedBy,
                            reason
                    )
            );
            logger.info("Notification event created for device {} status change", deviceID);
        } catch (Exception e) {
            logger.error("Failed to create notification for device {}", deviceID, e);
        }

        sample.stop(Timer.builder("device.service.statusChange")
                .description("Time taken to log status change and send notification")
                .tag("operation", "statusChange")
                .register(meterRegistry));

        long end = System.currentTimeMillis(); // End time
        long duration = end - start;
        logger.info("Execution time for logStatusChange (deviceID={}): {} ms", deviceID, duration); // ✅ Splunk-friendly log
    }


}
