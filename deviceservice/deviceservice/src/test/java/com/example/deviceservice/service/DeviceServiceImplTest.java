//package com.example.deviceservice.service;
//
//import com.example.deviceservice.dto.DeviceDTO;
//import com.example.deviceservice.dto.DeviceDetailsDTO;
//import com.example.deviceservice.model.AuditLog;
//import com.example.deviceservice.model.Device;
//import com.example.deviceservice.model.Owner;
//import com.example.deviceservice.model.StatusTracker;
//import com.example.deviceservice.repository.DeviceRepository;
//import com.example.deviceservice.repository.OwnerRepository;
//import com.example.deviceservice.repository.StatusTrackerRepository;
//import com.example.deviceservice.util.CSVExportException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.*;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.*;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class DeviceServiceImplTest {
//
//    @InjectMocks
//    private DeviceServiceImpl deviceService;
//
//    @Mock
//    private DeviceRepository deviceRepo;
//    @Mock
//    private AuditService auditService;
//    @Mock
//    private StatusTrackerRepository statusTrackerRepo;
//    @Mock
//    private OwnerRepository ownerRepo;
//
//    @Test
//    void registerDevice_savesDeviceAndLogs() {
//        DeviceDTO dto = new DeviceDTO();
//        dto.setStatus("active");
//        when(deviceRepo.existsById(anyString())).thenReturn(false);
//        when(deviceRepo.save(any(Device.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        DeviceDTO result = deviceService.registerDevice(dto);
//
//        assertNotNull(result);
//        verify(deviceRepo).save(any(Device.class));
//        verify(auditService).log(anyString(), eq("Device registered"));
//        verify(statusTrackerRepo).save(any(StatusTracker.class));
//    }
//
//    @Test
//    void updateDevice_updatesFieldsAndLogs() {
//        Device device = new Device();
//        device.setStatus("active");
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//        when(deviceRepo.save(any(Device.class))).thenReturn(device);
//
//        DeviceDTO updatedDTO = new DeviceDTO();
//        updatedDTO.setName("NewName");
//        updatedDTO.setStatus("inactive");
//
//        DeviceDTO result = deviceService.updateDevice("TEL123", updatedDTO);
//
//        assertNotNull(result);
//        assertEquals("NewName", device.getName());
//        assertEquals("inactive", device.getStatus());
//        verify(auditService).log(eq("TEL123"), eq("Device updated via PATCH"));
//        verify(statusTrackerRepo).save(any(StatusTracker.class));
//    }
//
//    @Test
//    void assignOwnerToDevice_assignsOwnerAndLogs() {
//        Device device = new Device();
//        device.setStatus("active");
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//        when(deviceRepo.save(any(Device.class))).thenReturn(device);
//
//        deviceService.assignOwnerToDevice("TEL123", "owner1");
//
//        assertEquals("owner1", device.getOwnerID());
//        verify(auditService).log(eq("TEL123"), contains("Owner assigned"));
//    }
//
//    @Test
//    void assignOwnerToDevice_inactiveDevice_throwsException() {
//        Device device = new Device();
//        device.setStatus("inactive");
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//
//        assertThrows(RuntimeException.class, () -> deviceService.assignOwnerToDevice("TEL123", "owner1"));
//    }
//
//    @Test
//    void softDeleteDevice_marksAsDeletedAndLogs() {
//        Device device = new Device();
//        device.setSoftDeleted(false);
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//        when(deviceRepo.save(any(Device.class))).thenReturn(device);
//
//        deviceService.softDeleteDevice("TEL123");
//
//        assertTrue(device.isSoftDeleted());
//        assertEquals("inactive", device.getStatus());
//        assertNull(device.getOwnerID());
//        verify(auditService).log(eq("TEL123"), contains("soft deleted"));
//        verify(statusTrackerRepo).save(any(StatusTracker.class));
//    }
//
//    @Test
//    void softDeleteDevice_alreadyDeleted_throwsException() {
//        Device device = new Device();
//        device.setSoftDeleted(true);
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//
//        assertThrows(RuntimeException.class, () -> deviceService.softDeleteDevice("TEL123"));
//    }
//
//    @Test
//    void recoverDevice_recoversAndLogs() {
//        Device device = new Device();
//        device.setSoftDeleted(true);
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//        when(deviceRepo.save(any(Device.class))).thenReturn(device);
//
//        deviceService.recoverDevice("TEL123");
//
//        assertFalse(device.isSoftDeleted());
//        assertEquals("active", device.getStatus());
//        verify(auditService).log(eq("TEL123"), contains("recovered"));
//        verify(statusTrackerRepo).save(any(StatusTracker.class));
//    }
//
//    @Test
//    void recoverDevice_notDeleted_throwsException() {
//        Device device = new Device();
//        device.setSoftDeleted(false);
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//
//        assertThrows(RuntimeException.class, () -> deviceService.recoverDevice("TEL123"));
//    }
//
//    @Test
//    void getDeviceDetails_returnsDetailsAndLogs() {
//        Device device = new Device();
//        when(deviceRepo.findById("TEL123")).thenReturn(Optional.of(device));
//
//        DeviceDetailsDTO result = deviceService.getDeviceDetails("TEL123");
//
//        assertNotNull(result);
//        verify(auditService).log(eq("TEL123"), eq("Device searched"));
//    }
//
//    @Test
//    void filterDevices_returnsFilteredList() {
//        Device device = new Device();
//        List<Device> devices = List.of(device);
//        when(deviceRepo.findByTypeAndManufacturerAndOwnerIDAndStatusAndPurchaseDateBetween(
//                any(), any(), any(), any(), any(), any())).thenReturn(devices);
//
//        List<DeviceDetailsDTO> result = deviceService.filterDevices("type", "manu", "owner", "active", LocalDate.now(), LocalDate.now());
//
//        assertEquals(1, result.size());
//    }
//
//    @Test
//    void getAllDevices_includeDeletedFalse_returnsActiveDevices() {
//        Device device = new Device();
//        when(deviceRepo.findBySoftDeletedFalse()).thenReturn(List.of(device));
//
//        List<DeviceDetailsDTO> result = deviceService.getAllDevices(false);
//
//        assertEquals(1, result.size());
//    }
//
//    @Test
//    void getAllDevices_includeDeletedTrue_returnsAllDevices() {
//        Device device = new Device();
//        when(deviceRepo.findAll()).thenReturn(List.of(device));
//
//        List<DeviceDetailsDTO> result = deviceService.getAllDevices(true);
//
//        assertEquals(1, result.size());
//    }
//
//    @Test
//    void getAuditLogs_returnsFormattedLogs() {
//        AuditLog log = mock(AuditLog.class);
//        when(log.getLogId()).thenReturn("L1");
//        when(log.getTimestamp()).thenReturn(LocalDateTime.now());
//        when(log.getAction()).thenReturn("Action");
//        when(auditService.getLogsForDevice("TEL123")).thenReturn(List.of(log));
//
//        List<String> logs = deviceService.getAuditLogs("TEL123");
//
//        assertEquals(1, logs.size());
//        assertTrue(logs.get(0).contains("L1"));
//    }
//
//    @Test
//    void exportDevicesToCSV_exception_throwsCSVExportException() {
//        when(deviceRepo.findAll()).thenThrow(new RuntimeException("DB error"));
//        assertThrows(CSVExportException.class, () -> deviceService.exportDevicesToCSV());
//    }
//}