package com.example.deviceservice.service;

import com.example.deviceservice.model.AuditLog;

import java.util.List;

public interface AuditService {
    void log(String deviceID, String action);
    List<AuditLog> getLogsForDevice(String deviceID);
}