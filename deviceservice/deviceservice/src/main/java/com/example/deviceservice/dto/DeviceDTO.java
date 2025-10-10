package com.example.deviceservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class DeviceDTO {
    private String deviceID;

    @NotBlank(message = "Device name is required")
    private String name;

    @NotBlank(message = "Device type is required")
    private String type;

    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    private LocalDate createdOn;
    private LocalDate lastUpdate;
    private String ownerID;

    @Pattern(regexp = "Active|inactive|Retired", message = "Status must be either 'active' or 'inactive' or 'retired'")
    private String status;

    private LocalDate deletedOn;
    private String updatedBy;
    private String reason;

    // Constructors
    public DeviceDTO() {}

    public DeviceDTO(String deviceID, String name, String type, String manufacturer,
                     LocalDate purchaseDate, LocalDate createdOn, LocalDate lastUpdate,
                     String ownerID, String status, LocalDate deletedOn) {
        this.deviceID = deviceID;
        this.name = name;
        this.type = type;
        this.manufacturer = manufacturer;
        this.purchaseDate = purchaseDate;
        this.createdOn = createdOn;
        this.lastUpdate = lastUpdate;
        this.ownerID = ownerID;
        this.status = status;
        this.deletedOn = deletedOn;
    }

    // Getters and Setters
    public String getDeviceID() {
        return deviceID;
    }

    public void setDeviceID(String deviceID) {
        this.deviceID = deviceID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(LocalDate createdOn) {
        this.createdOn = createdOn;
    }

    public LocalDate getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(LocalDate lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public String getOwnerID() {
        return ownerID;
    }

    public void setOwnerID(String ownerID) {
        this.ownerID = ownerID;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeletedOn() {
        return deletedOn;
    }

    public void setDeletedOn(LocalDate deletedOn) {
        this.deletedOn = deletedOn;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}