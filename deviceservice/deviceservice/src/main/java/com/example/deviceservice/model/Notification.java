package com.example.deviceservice.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId;
    private String oldStatus;
    private String newStatus;
    private Instant timestamp;
    private String changedBy;
    private String reason;

    private boolean acknowledged = false;
    private String acknowledgedBy;
    private Instant acknowledgedAt;

    public Notification() {}

    public Notification(String deviceId, String oldStatus, String newStatus,
                        Instant timestamp, String changedBy, String reason) {
        this.deviceId = deviceId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.timestamp = timestamp;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getDeviceId() { return deviceId; }
    public String getOldStatus() { return oldStatus; }
    public String getNewStatus() { return newStatus; }
    public Instant getTimestamp() { return timestamp; }
    public String getChangedBy() { return changedBy; }
    public String getReason() { return reason; }
    public boolean isAcknowledged() { return acknowledged; }
    public String getAcknowledgedBy() { return acknowledgedBy; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }

    public void setId(Long id) { this.id = id; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }
    public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public void setReason(String reason) { this.reason = reason; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
}

