//package com.example.deviceservice.repository;
//
//import com.example.deviceservice.model.AuditLog;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//@DataJpaTest
//public class AuditLogRepositoryTest {
//
//    @Autowired
//    private AuditLogRepository auditLogRepository;
//
//    @Test
//    void testSaveAndFindByDeviceID() {
//        AuditLog log = new AuditLog("device123", LocalDateTime.now(), "CREATED");
//        auditLogRepository.save(log);
//
//        List<AuditLog> logs = auditLogRepository.findByDeviceID("device123");
//        assertThat(logs).isNotEmpty();
//        assertThat(logs.get(0).getAction()).isEqualTo("CREATED");
//    }
//
//    @Test
//    void testFindByDeviceIDReturnsEmptyForUnknownDevice() {
//        List<AuditLog> logs = auditLogRepository.findByDeviceID("unknown");
//        assertThat(logs).isEmpty();
//    }
//}