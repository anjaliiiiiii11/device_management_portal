package com.example.deviceservice.controller;

import com.example.deviceservice.dto.NotificationDTO;
import com.example.deviceservice.events.DeviceStatusChangedEvent;
import com.example.deviceservice.model.Notification;
import com.example.deviceservice.repository.NotificationRepository;
import com.example.deviceservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepo;

    @GetMapping("/recent")
    public ResponseEntity<List<Notification>> getRecentNotifications() {
        List<Notification> notifications = notificationRepo.findTop50ByOrderByTimestampDesc();
        return ResponseEntity.ok(notifications);
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Notification> acknowledgeNotification(
            @PathVariable Long id,
            @RequestParam String user) {

        Notification updated = notificationService.acknowledgeNotification(id, user);
        return ResponseEntity.ok(updated);
    }
}


