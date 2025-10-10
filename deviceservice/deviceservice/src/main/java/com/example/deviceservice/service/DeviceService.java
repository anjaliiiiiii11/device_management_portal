package com.example.deviceservice.service;

import com.example.deviceservice.dto.DeviceDTO;
import com.example.deviceservice.dto.DeviceDetailsDTO;

import java.time.LocalDate;
import java.util.List;

public interface DeviceService {
    DeviceDTO registerDevice(DeviceDTO dto);
    DeviceDTO updateDevice(String deviceID, DeviceDTO updatedDTO);
    DeviceDetailsDTO getDeviceDetails(String deviceID);
    List<DeviceDetailsDTO> filterDevices(String deviceID, String type, String manufacturer, String ownerID, String status, LocalDate startDate, LocalDate endDate);
    void softDeleteDevice(String deviceID);
    void recoverDevice(String deviceID);
    List<String> getAuditLogs(String deviceID);
    List<DeviceDetailsDTO> getAllDevices(boolean includeDeleted);
    void assignOwnerToDevice(String deviceID, String ownerID);
    void exportDevicesToCSV();
    void exportStatusTrackerToCSV();
    void exportOwnersToCSV();
}