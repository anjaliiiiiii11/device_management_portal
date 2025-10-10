package com.example.deviceservice.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class OwnerNotFoundException extends RuntimeException {
    public OwnerNotFoundException(String ownerID) {
        super("Owner with ID " + ownerID + " not found.");
    }
}
