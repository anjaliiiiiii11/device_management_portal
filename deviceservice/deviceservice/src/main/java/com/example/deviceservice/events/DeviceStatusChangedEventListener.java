package com.example.deviceservice.events;


import com.example.deviceservice.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DeviceStatusChangedEventListener {

    private final NotificationService notificationService;

    public DeviceStatusChangedEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void onDeviceStatusChanged(DeviceStatusChangedEvent event) {
        // offload heavy tasks if needed using executor
        notificationService.handleDeviceStatusChanged(event);
    }
}