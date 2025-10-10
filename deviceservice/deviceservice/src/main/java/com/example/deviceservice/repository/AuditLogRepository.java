package com.example.deviceservice.repository;

import com.example.deviceservice.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByDeviceID(String deviceID);
//    AuditLog findFirstByDeviceIDOrderByTimestampDesc(String deviceID);
}