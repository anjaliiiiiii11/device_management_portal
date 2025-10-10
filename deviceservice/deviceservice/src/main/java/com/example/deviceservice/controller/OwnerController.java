package com.example.deviceservice.controller;

import com.example.deviceservice.dto.OwnerDTO;
import com.example.deviceservice.service.OwnerService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/owners")
public class OwnerController {

    private static final Logger logger = LogManager.getLogger(OwnerController.class);

    @Autowired
    private OwnerService ownerService;

    @PostMapping
    public OwnerDTO createOwner(@RequestBody OwnerDTO ownerDTO) {
        logger.info("Creating new owner: {}", ownerDTO.getOwnerID());
        return ownerService.registerOwner(ownerDTO);
    }

    @GetMapping
    public List<OwnerDTO> getAllOwners() {
        logger.info("Fetching all owners");
        return ownerService.getAllOwners();
    }

    @GetMapping("/{id}")
    public OwnerDTO getOwnerById(@PathVariable String id) {
        logger.info("Fetching owner details for ID: {}", id);
        return ownerService.getOwnerById(id);
    }

    @PatchMapping("/{id}")
    public OwnerDTO partiallyUpdateOwner(@PathVariable String id, @RequestBody OwnerDTO ownerDTO) {
        logger.info("Partially updating owner ID: {} with data: {}", id, ownerDTO);
        return ownerService.partiallyUpdateOwner(id, ownerDTO);
    }

    @DeleteMapping("/{id}")
    public void deleteOwner(@PathVariable String id) {
        logger.info("Deleting owner with ID: {}", id);
        ownerService.deleteOwner(id);
    }
}
