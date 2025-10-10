package com.example.deviceservice.mapper;

import com.example.deviceservice.dto.DeviceDTO;
import com.example.deviceservice.model.Device;

public class DeviceMapper {

    public static DeviceDTO toDTO(Device device) {
        if (device == null) return null;

        DeviceDTO dto = new DeviceDTO();
        dto.setDeviceID(device.getDeviceID());
        dto.setName(device.getName());
        dto.setType(device.getType());
        dto.setManufacturer(device.getManufacturer());
        dto.setPurchaseDate(device.getPurchaseDate());
        dto.setCreatedOn(device.getCreatedOn());
        dto.setLastUpdate(device.getLastUpdate());
        dto.setOwnerID(device.getOwnerID());
        dto.setStatus(device.getStatus());
        dto.setDeletedOn(device.getDeletedOn());
        dto.setUpdatedBy(device.getUpdatedBy());
        dto.setReason(device.getReason());
        return dto;
    }

    public static Device toEntity(DeviceDTO dto) {
        if (dto == null) return null;

        Device device = new Device();
        device.setDeviceID(dto.getDeviceID());
        device.setName(dto.getName());
        device.setType(dto.getType());
        device.setManufacturer(dto.getManufacturer());
        device.setPurchaseDate(dto.getPurchaseDate());
        device.setCreatedOn(dto.getCreatedOn());
        device.setLastUpdate(dto.getLastUpdate());
        device.setOwnerID(dto.getOwnerID());
        device.setStatus(dto.getStatus());
        device.setDeletedOn(dto.getDeletedOn());
        device.setUpdatedBy(dto.getUpdatedBy());
        device.setReason(dto.getReason());
        return device;
    }
}
