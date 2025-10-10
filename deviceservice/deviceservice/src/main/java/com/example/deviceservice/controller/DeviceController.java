package com.example.deviceservice.controller;

import com.example.deviceservice.dto.DeviceDTO;
import com.example.deviceservice.dto.DeviceDetailsDTO;
import com.example.deviceservice.service.DeviceService;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private static final Logger logger = LogManager.getLogger(DeviceController.class);

    @Autowired
    private DeviceService deviceService;

    @GetMapping
    public ResponseEntity<List<DeviceDetailsDTO>> getAllDevices(
            @RequestParam(required = false) String deviceID,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) String ownerID,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "false") boolean includeDeleted
    ) {
        logger.info("Fetching devices with filters - deviceID: {}, type: {}, manufacturer: {}, ownerID: {}, status: {}, startDate: {}, endDate: {}, includeDeleted: {}",
                deviceID, type, manufacturer, ownerID, status, startDate, endDate, includeDeleted);

        List<DeviceDetailsDTO> result;
        boolean hasFilters = deviceID != null || type != null || manufacturer != null || ownerID != null
                || startDate != null || endDate != null || status != null;

        if (hasFilters) {
            result = deviceService.filterDevices(deviceID, type, manufacturer, ownerID, status, startDate, endDate);
        } else {
            result = deviceService.getAllDevices(includeDeleted);
        }

        if (result == null) {
            result = new ArrayList<>();
        }

        return ResponseEntity.ok(result);
    }


    @GetMapping("/{deviceID}")
    public ResponseEntity<DeviceDetailsDTO> getDeviceDetails(@PathVariable String deviceID) {
        logger.info("Fetching device details for ID: {}", deviceID);
        DeviceDetailsDTO details = deviceService.getDeviceDetails(deviceID);
        return ResponseEntity.ok(details);
    }

    @PostMapping
    public ResponseEntity<DeviceDTO> createDevice(@Valid @RequestBody DeviceDTO deviceDTO) {
        logger.info("Creating new device: {}", deviceDTO.getDeviceID());
        DeviceDTO created = deviceService.registerDevice(deviceDTO);
        return ResponseEntity.ok(created);
    }

    @PatchMapping("/{deviceID}/update")
    public ResponseEntity<DeviceDTO> updateDevice(
            @PathVariable String deviceID,
            @Valid @RequestBody DeviceDTO updatedDTO) {
        logger.info("Updating device ID: {} with data: {}", deviceID, updatedDTO);
        DeviceDTO updated = deviceService.updateDevice(deviceID, updatedDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{deviceID}/soft-delete")
    public ResponseEntity<Void> softDeleteDevice(@PathVariable String deviceID) {
        logger.info("Soft deleting device ID: {}", deviceID);
        deviceService.softDeleteDevice(deviceID);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{deviceID}/recover")
    public ResponseEntity<Void> recoverDevice(@PathVariable String deviceID) {
        logger.info("Recovering device ID: {}", deviceID);
        deviceService.recoverDevice(deviceID);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{deviceID}/audit")
    public ResponseEntity<List<String>> getAuditLogs(@PathVariable String deviceID) {
        logger.info("Fetching audit logs for device ID: {}", deviceID);
        List<String> logs = deviceService.getAuditLogs(deviceID);
        return ResponseEntity.ok(logs);
    }

    @PatchMapping("/{deviceID}/assign-owner")
    public ResponseEntity<Void> assignOwner(
            @PathVariable String deviceID,
            @RequestParam String ownerID) {
        logger.info("Assigning owner ID: {} to device ID: {}", ownerID, deviceID);
        deviceService.assignOwnerToDevice(deviceID, ownerID);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export/csv")
    public ResponseEntity<String> exportCSV() {
        logger.info("Exporting CSV files for devices, status tracker, and owners");
        deviceService.exportDevicesToCSV();
        deviceService.exportStatusTrackerToCSV();
        deviceService.exportOwnersToCSV();
        return ResponseEntity.ok("CSV files exported successfully");
    }

//    @GetMapping("/sorts")
//    public ResponseEntity<List<DeviceDetailsDTO>> getSortedDevices() {
//        logger.info("Sorting devices by recent activity");
//        List<DeviceDetailsDTO> sortedDevices = deviceService.getDevicesSortedByRecentActivity();
//        return ResponseEntity.ok(sortedDevices);
//    }

}
