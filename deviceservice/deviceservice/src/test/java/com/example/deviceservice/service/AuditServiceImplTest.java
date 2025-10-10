package com.example.deviceservice.service;

import com.example.deviceservice.model.AuditLog;
import com.example.deviceservice.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
public class AuditServiceImplTest {

    @Mock
    private AuditLogRepository auditRepo;

    @InjectMocks
    private AuditServiceImpl auditService;

    @Test
    void testLogSavesAuditLog() {
        auditService.log("device123", "UPDATED");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditRepo, times(1)).save(captor.capture());

        AuditLog savedLog = captor.getValue();
        assertThat(savedLog.getDeviceID()).isEqualTo("device123");
        assertThat(savedLog.getAction()).isEqualTo("UPDATED");
        assertThat(savedLog.getTimestamp()).isNotNull();
    }

    @Test
    void testGetLogsForDeviceReturnsLogs() {
        AuditLog log1 = new AuditLog("device123", java.time.LocalDateTime.now(), "CREATED");
        AuditLog log2 = new AuditLog("device123", java.time.LocalDateTime.now(), "UPDATED");
        when(auditRepo.findByDeviceID("device123")).thenReturn(Arrays.asList(log1, log2));

        List<AuditLog> logs = auditService.getLogsForDevice("device123");
        assertThat(logs).hasSize(2);
        assertThat(logs.get(0).getAction()).isEqualTo("CREATED");
        assertThat(logs.get(1).getAction()).isEqualTo("UPDATED");
    }
}