package com.example.deviceservice.service;

import com.example.deviceservice.dto.OwnerDTO;
import com.example.deviceservice.model.Owner;
import com.example.deviceservice.repository.OwnerRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class OwnerServiceImpl implements OwnerService {

    private static final Logger logger = LogManager.getLogger(OwnerServiceImpl.class);

    @Autowired
    private OwnerRepository ownerRepo;

    @Override
    public OwnerDTO registerOwner(OwnerDTO dto) {
        String ownerID = generateUniqueOwnerID();
        logger.info("Registering new owner: {}", ownerID);
        Owner owner = new Owner(ownerID, dto.getName(), dto.getContactInfo());
        Owner saved = ownerRepo.save(owner);
        logger.debug("Owner saved: {}", saved);
        return toDTO(saved);
    }

    @Override
    public List<OwnerDTO> getAllOwners() {
        logger.info("Fetching all owners");
        List<OwnerDTO> owners = ownerRepo.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        logger.debug("Total owners fetched: {}", owners.size());
        return owners;
    }

    @Override
    public OwnerDTO getOwnerById(String id) {
        logger.info("Fetching owner by ID: {}", id);
        Owner owner = ownerRepo.findById(id)
                .orElseThrow(() -> {
                    logger.error("Owner not found for ID: {}", id);
                    return new RuntimeException("Owner not found");
                });
        return toDTO(owner);
    }

    @Override
    public OwnerDTO partiallyUpdateOwner(String id, OwnerDTO dto) {
        logger.info("Partially updating owner ID: {} with data: {}", id, dto);
        Owner existing = ownerRepo.findById(id)
                .orElseThrow(() -> {
                    logger.error("Owner not found for ID: {}", id);
                    return new RuntimeException("Owner not found");
                });

        if (dto.getName() != null) {
            existing.setName(dto.getName());
        }
        if (dto.getContactInfo() != null) {
            existing.setContactInfo(dto.getContactInfo());
        }

        Owner updated = ownerRepo.save(existing);
        logger.debug("Owner updated: {}", updated);
        return toDTO(updated);
    }

    @Override
    public void deleteOwner(String id) {
        logger.info("Deleting owner with ID: {}", id);
        if (!ownerRepo.existsById(id)) {
            logger.warn("Attempted to delete non-existent owner ID: {}", id);
            throw new RuntimeException("Owner not found");
        }
        ownerRepo.deleteById(id);
        logger.debug("Owner deleted: {}", id);
    }

    private OwnerDTO toDTO(Owner owner) {
        OwnerDTO dto = new OwnerDTO(owner.getOwnerID(), owner.getName(), owner.getContactInfo());
        logger.debug("Mapped Owner to DTO: {}", dto);
        return dto;
    }

    private String generateUniqueOwnerID() {
        String id;
        Random random = new Random();
        do {
            int number = random.nextInt(900000) + 100000;
            id = "OWN" + number;
        } while (ownerRepo.existsById(id));
        logger.debug("Generated unique owner ID: {}", id);
        return id;
    }
}
