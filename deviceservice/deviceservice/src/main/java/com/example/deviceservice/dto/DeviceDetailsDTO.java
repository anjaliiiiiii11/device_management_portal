package com.example.deviceservice.dto;

import java.time.LocalDate;

public class DeviceDetailsDTO {
    private DeviceDTO device;

    public DeviceDetailsDTO() {}

    public DeviceDetailsDTO(DeviceDTO device) {
        this.device = device;
    }

    public DeviceDTO getDevice() {
        return device;
    }

    public void setDevice(DeviceDTO device) {
        this.device = device;
    }

    public String getStatus() {
        return device != null ? device.getStatus() : null;
    }

    public String getType() {
        return device != null ? device.getType() : null;
    }

    public String getManufacturer() {
        return device != null ? device.getManufacturer() : null;
    }

    public String getOwnerID() {
        return device != null ? device.getOwnerID() : null;
    }

    public LocalDate getPurchaseDate() {
        return device != null ? device.getPurchaseDate() : null;
    }
}