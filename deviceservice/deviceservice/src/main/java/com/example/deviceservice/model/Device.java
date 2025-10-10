package com.example.deviceservice.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "device")
public class Device {

    @Id
    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceID;

    @Column(name = "name")
    private String name;

    @Column(name = "type")
    private String type;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "created_on")
    private LocalDate createdOn;

    @Column(name = "last_update")
    private LocalDate lastUpdate;

    @Column(name = "deleted_on")
    private LocalDate deletedOn;

    @Column(name = "owner_id")
    private String ownerID;

    @Column(name = "status")
    private String status;

    @Column(name = "is_soft_deleted")
    private boolean softDeleted;

    private String updatedBy;  // Who changed it
    private String reason;     // Why it was changed

    // Constructors
    public Device() {}

    public Device(String deviceID, String name, String type, String manufacturer,
                  LocalDate purchaseDate, LocalDate createdOn, LocalDate lastUpdate,
                  String ownerID, String status, boolean softDeleted) {
        this.deviceID = deviceID;
        this.name = name;
        this.type = type;
        this.manufacturer = manufacturer;
        this.purchaseDate = purchaseDate;
        this.createdOn = createdOn;
        this.lastUpdate = lastUpdate;
        this.ownerID = ownerID;
        this.status = status;
        this.softDeleted = softDeleted;
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

    public LocalDate getDeletedOn() {
        return deletedOn;
    }

    public void setDeletedOn(LocalDate deletedOn) {
        this.deletedOn = deletedOn;
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

    public boolean isSoftDeleted() {
        return softDeleted;
    }

    public void setSoftDeleted(boolean softDeleted) {
        this.softDeleted = softDeleted;
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