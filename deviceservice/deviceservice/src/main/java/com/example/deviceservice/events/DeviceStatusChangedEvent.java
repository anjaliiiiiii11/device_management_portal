package com.example.deviceservice.events;

import java.time.Instant;

public class DeviceStatusChangedEvent {
    private final String deviceId;
    private final String oldStatus;
    private final String newStatus;
    private final Instant timestamp;
    private final String changedBy;
    private final String reason;

    public DeviceStatusChangedEvent(String deviceId, String oldStatus, String newStatus,
                                    Instant timestamp, String changedBy, String reason) {
        this.deviceId = deviceId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.timestamp = timestamp;
        this.changedBy = changedBy;
        this.reason = reason;
    }

    // getters
    public String getDeviceId() { return deviceId; }
    public String getOldStatus() { return oldStatus; }
    public String getNewStatus() { return newStatus; }
    public Instant getTimestamp() { return timestamp; }
    public String getChangedBy() { return changedBy; }
    public String getReason() { return reason; }
}



