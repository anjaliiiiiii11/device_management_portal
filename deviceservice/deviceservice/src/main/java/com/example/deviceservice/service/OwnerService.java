package com.example.deviceservice.service;

import com.example.deviceservice.dto.OwnerDTO;

import java.util.List;

public interface OwnerService {
    OwnerDTO registerOwner(OwnerDTO dto);
    List<OwnerDTO> getAllOwners();
    OwnerDTO getOwnerById(String id);
    OwnerDTO partiallyUpdateOwner(String id, OwnerDTO dto);
    void deleteOwner(String id);
}