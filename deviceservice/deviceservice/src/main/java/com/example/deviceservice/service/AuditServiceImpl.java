package com.example.deviceservice.service;

import com.example.deviceservice.model.AuditLog;
import com.example.deviceservice.repository.AuditLogRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditServiceImpl implements AuditService {

    private static final Logger logger = LogManager.getLogger(AuditServiceImpl.class);

    @Autowired
    private AuditLogRepository auditRepo;

    @Override
    public void log(String deviceID, String action) {
        logger.info("Logging action '{}' for device ID: {}", action, deviceID);
        AuditLog log = new AuditLog(deviceID, LocalDateTime.now(), action);
        auditRepo.save(log);
        logger.debug("Audit log saved: {}", log);
    }

    @Override
    public List<AuditLog> getLogsForDevice(String deviceID) {
        logger.info("Retrieving audit logs for device ID: {}", deviceID);
        List<AuditLog> logs = auditRepo.findByDeviceID(deviceID);
        logger.debug("Retrieved {} audit logs for device ID: {}", logs.size(), deviceID);
        return logs;
    }
}
