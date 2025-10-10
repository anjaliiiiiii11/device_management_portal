package com.example.deviceservice.service;

import com.example.deviceservice.events.DeviceStatusChangedEvent;
import com.example.deviceservice.model.Notification;
import com.example.deviceservice.repository.NotificationRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private MailService mailService;

    @Value("${notification.admin.email}")
    private String adminEmail;

    private static final Logger logger = LogManager.getLogger(NotificationService.class);

    public void handleDeviceStatusChanged(DeviceStatusChangedEvent event) {
        Notification notification = new Notification(
                event.getDeviceId(),
                event.getOldStatus(),
                event.getNewStatus(),
                event.getTimestamp(),
                event.getChangedBy(),
                event.getReason()
        );

        // Save to DB
        notificationRepo.save(notification);

        // Send via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications", notification);

        // Send email to admin
        String subject = "Device Status Changed: " + event.getDeviceId();
        String body = "Device " + event.getDeviceId() + " changed from " + event.getOldStatus()
                + " to " + event.getNewStatus()
                + "\nChanged by: " + event.getChangedBy()
                + "\nReason: " + event.getReason()
                + "\nTime: " + event.getTimestamp();

        try {
            mailService.sendEmail(adminEmail, subject, body);
            logger.info("Email sent to admin: {}", adminEmail);
        } catch (Exception e) {
            logger.error("Failed to send email for device: {}", event.getDeviceId(), e);
        }
    }

    public Notification acknowledgeNotification(Long id, String user) {
        Notification notification = notificationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setAcknowledged(true);
        notification.setAcknowledgedBy(user);
        notification.setAcknowledgedAt(Instant.now());

        notificationRepo.save(notification);

        // Broadcast updated notification to all clients
        messagingTemplate.convertAndSend("/topic/notifications", notification);

        logger.info("Notification {} acknowledged by {}", id, user);

        return notification;
    }
}

