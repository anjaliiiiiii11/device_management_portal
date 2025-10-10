package com.example.deviceservice.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @Column(name = "log_id", nullable = false, unique = true)
    private String logId;

    @Column(name = "device_id", nullable = false)
    private String deviceID;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "action", nullable = false)
    private String action;

    public AuditLog() {
        this.logId = UUID.randomUUID().toString();
    }

    public AuditLog(String deviceID, LocalDateTime timestamp, String action) {
        this.logId = UUID.randomUUID().toString();
        this.deviceID = deviceID;
        this.timestamp = timestamp;
        this.action = action;
    }

    // Getters and Setters
    public String getLogId() {
        return logId;
    }

    public String getDeviceID() {
        return deviceID;
    }

    public void setDeviceID(String deviceID) {
        this.deviceID = deviceID;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}