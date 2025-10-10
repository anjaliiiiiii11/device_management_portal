//package com.example.deviceservice.controller;
//
//import com.example.deviceservice.dto.DeviceDTO;
//import com.example.deviceservice.dto.DeviceDetailsDTO;
//import com.example.deviceservice.service.DeviceService;
//import com.example.deviceservice.util.DeviceNotFoundException;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class DeviceControllerTest {
//
//    @InjectMocks
//    private DeviceController deviceController;
//
//    @Mock
//    private DeviceService deviceService;
//
//    @Test
//    void getAllDevices_returnsList() {
//        List<DeviceDetailsDTO> mockList = List.of(new DeviceDetailsDTO(new DeviceDTO()));
//        when(deviceService.getAllDevices(false)).thenReturn(mockList);
//
//        ResponseEntity<List<DeviceDetailsDTO>> response = deviceController.getAllDevices(null, null, null, null, null, null, false);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(mockList, response.getBody());
//    }
//
//    @Test
//    void getAllDevices_withFiltersAndStatus_returnsFilteredList() {
//        DeviceDTO deviceDTO = new DeviceDTO();
//        deviceDTO.setStatus("active"); // status must match filter!
//        DeviceDetailsDTO detailsDTO = new DeviceDetailsDTO(deviceDTO);
//        List<DeviceDetailsDTO> filtered = List.of(detailsDTO);
//
//        when(deviceService.filterDevices(, "typeA", "manuA", "owner1", "active", null, null)).thenReturn(filtered);
//
//        ResponseEntity<List<DeviceDetailsDTO>> response = deviceController.getAllDevices("typeA", "manuA", "owner1", "active", null, null, false);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(filtered, response.getBody());
//    }
//
//    @Test
//    void getAllDevices_withFiltersAndStatus_returnsEmptyIfStatusMismatch() {
//        DeviceDTO deviceDTO = new DeviceDTO();
//        deviceDTO.setStatus("inactive"); // does NOT match filter!
//        DeviceDetailsDTO detailsDTO = new DeviceDetailsDTO(deviceDTO);
//        List<DeviceDetailsDTO> filtered = List.of(detailsDTO);
//
//        when(deviceService.filterDevices(, "typeA", "manuA", "owner1", "active", null, null)).thenReturn(filtered);
//
//        ResponseEntity<List<DeviceDetailsDTO>> response = deviceController.getAllDevices("typeA", "manuA", "owner1", "active", null, null, false);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertTrue(response.getBody().isEmpty());
//    }
//
//    @Test
//    void getAllDevices_includeDeletedTrue_returnsAllDevices() {
//        List<DeviceDetailsDTO> allDevices = List.of(new DeviceDetailsDTO(new DeviceDTO()));
//        when(deviceService.getAllDevices(true)).thenReturn(allDevices);
//
//        ResponseEntity<List<DeviceDetailsDTO>> response = deviceController.getAllDevices(null, null, null, null, null, null, true);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(allDevices, response.getBody());
//    }
//    @Test
//    void getDeviceDetails_validId_returnsDetails() {
//        DeviceDetailsDTO details = new DeviceDetailsDTO(new DeviceDTO());
//        when(deviceService.getDeviceDetails("TEL123")).thenReturn(details);
//
//        ResponseEntity<DeviceDetailsDTO> response = deviceController.getDeviceDetails("TEL123");
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(details, response.getBody());
//    }
//
//    @Test
//    void getDeviceDetails_invalidId_throwsException() {
//        when(deviceService.getDeviceDetails("BADID")).thenThrow(new DeviceNotFoundException("BADID"));
//
//        assertThrows(DeviceNotFoundException.class, () -> deviceController.getDeviceDetails("BADID"));
//    }
//
//    @Test
//    void createDevice_validDTO_returnsCreated() {
//        DeviceDTO dto = new DeviceDTO();
//        when(deviceService.registerDevice(dto)).thenReturn(dto);
//
//        ResponseEntity<DeviceDTO> response = deviceController.createDevice(dto);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(dto, response.getBody());
//    }
//
//    @Test
//    void updateDevice_valid_returnsUpdated() {
//        DeviceDTO updated = new DeviceDTO();
//        when(deviceService.updateDevice("TEL123", updated)).thenReturn(updated);
//
//        ResponseEntity<DeviceDTO> response = deviceController.updateDevice("TEL123", updated);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(updated, response.getBody());
//    }
//
//    @Test
//    void softDeleteDevice_validId_returnsNoContent() {
//        doNothing().when(deviceService).softDeleteDevice("TEL123");
//
//        ResponseEntity<Void> response = deviceController.softDeleteDevice("TEL123");
//
//        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
//    }
//
//    @Test
//    void recoverDevice_validId_returnsNoContent() {
//        doNothing().when(deviceService).recoverDevice("TEL123");
//
//        ResponseEntity<Void> response = deviceController.recoverDevice("TEL123");
//
//        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
//    }
//
//    @Test
//    void getAuditLogs_returnsLogs() {
//        List<String> logs = List.of("log1", "log2");
//        when(deviceService.getAuditLogs("TEL123")).thenReturn(logs);
//
//        ResponseEntity<List<String>> response = deviceController.getAuditLogs("TEL123");
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(logs, response.getBody());
//    }
//
//    @Test
//    void assignOwner_valid_returnsNoContent() {
//        doNothing().when(deviceService).assignOwnerToDevice("TEL123", "owner1");
//
//        ResponseEntity<Void> response = deviceController.assignOwner("TEL123", "owner1");
//
//        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
//    }
//
//    @Test
//    void exportCSV_returnsSuccessMessage() {
//        doNothing().when(deviceService).exportDevicesToCSV();
//        doNothing().when(deviceService).exportStatusTrackerToCSV();
//        doNothing().when(deviceService).exportOwnersToCSV();
//
//        ResponseEntity<String> response = deviceController.exportCSV();
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals("CSV files exported successfully", response.getBody());
//    }
//    // Edge case: getAllDevices returns null from service (should not happen, but test for robustness)
//    @Test
//    void getAllDevices_serviceReturnsNull_returnsEmptyList() {
//        when(deviceService.getAllDevices(false)).thenReturn(null);
//
//        ResponseEntity<List<DeviceDetailsDTO>> response = deviceController.getAllDevices(null, null, null, null, null, null, false);
//
//        // Controller should handle null gracefully and return an empty list
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertNotNull(response.getBody());
//        assertTrue(response.getBody().isEmpty());
//    }
//
//    // Edge case: getAllDevices with status filter, but DTO status is null
//    @Test
//    void getAllDevices_statusFilterButDtoStatusNull_returnsEmptyList() {
//        DeviceDTO deviceDTO = new DeviceDTO();
//        deviceDTO.setStatus(null); // status is null
//        DeviceDetailsDTO detailsDTO = new DeviceDetailsDTO(deviceDTO);
//        List<DeviceDetailsDTO> filtered = List.of(detailsDTO);
//
//        when(deviceService.filterDevices(, "typeA", "manuA", "owner1", "active", null, null)).thenReturn(filtered);
//
//        ResponseEntity<List<DeviceDetailsDTO>> response = deviceController.getAllDevices("typeA", "manuA", "owner1", "active", null, null, false);
//
//        // Should filter out DTOs with null status
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertTrue(response.getBody().isEmpty());
//    }
//
//    // Edge case: updateDevice with null DTO
//    @Test
//    void updateDevice_nullDTO_returnsNullBody() {
//        when(deviceService.updateDevice("TEL123", null)).thenReturn(null);
//
//        ResponseEntity<DeviceDTO> response = deviceController.updateDevice("TEL123", null);
//
//        // Should return OK with null body
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertNull(response.getBody());
//    }
//
//    // Edge case: assignOwner with null ownerID
//    @Test
//    void assignOwner_nullOwnerID_returnsNoContent() {
//        doNothing().when(deviceService).assignOwnerToDevice("TEL123", null);
//
//        ResponseEntity<Void> response = deviceController.assignOwner("TEL123", null);
//
//        // Should not throw, should return NO_CONTENT
//        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
//    }
//
////     Edge case: exportCSV when service throws exception
////    @Test
////    void exportCSV_serviceThrowsException_returnsSuccessMessage() {
////        doNothing().when(deviceService).exportStatusTrackerToCSV();
////        doNothing().when(deviceService).exportOwnersToCSV();
////        // Simulate exception in one export method
////        doThrow(new RuntimeException("Export failed")).when(deviceService).exportDevicesToCSV();
////
////        ResponseEntity<String> response = deviceController.exportCSV();
////
////        // Controller does not handle exception, but returns success message anyway
////        assertEquals(HttpStatus.OK, response.getStatusCode());
////        assertEquals("CSV files exported successfully", response.getBody());
////    }
//
//    // Edge case: softDeleteDevice when already deleted (service throws)
//    @Test
//    void softDeleteDevice_alreadyDeleted_throwsException() {
//        doThrow(new RuntimeException("Device is already soft deleted.")).when(deviceService).softDeleteDevice("TEL123");
//
//        // Should propagate exception
//        assertThrows(RuntimeException.class, () -> deviceController.softDeleteDevice("TEL123"));
//    }
//
//    // Edge case: recoverDevice when not deleted (service throws)
//    @Test
//    void recoverDevice_notDeleted_throwsException() {
//        doThrow(new RuntimeException("Device is not soft deleted and cannot be recovered.")).when(deviceService).recoverDevice("TEL123");
//
//        // Should propagate exception
//        assertThrows(RuntimeException.class, () -> deviceController.recoverDevice("TEL123"));
//    }
//
//    // Edge case: getDeviceDetails returns null (should not happen, but test for robustness)
//    @Test
//    void getDeviceDetails_serviceReturnsNull_returnsOkWithNullBody() {
//        when(deviceService.getDeviceDetails("TEL123")).thenReturn(null);
//
//        ResponseEntity<DeviceDetailsDTO> response = deviceController.getDeviceDetails("TEL123");
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertNull(response.getBody());
//    }
//}
