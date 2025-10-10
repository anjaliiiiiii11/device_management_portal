package com.example.deviceservice.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidDeviceOperationException extends RuntimeException {
    public InvalidDeviceOperationException(String deviceID, String reason) {
        super("Device ID " + deviceID + " cannot be updated: " + reason);
    }
}
