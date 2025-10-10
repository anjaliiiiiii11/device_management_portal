package com.example.deviceservice.repository;

import com.example.deviceservice.model.StatusTracker;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusTrackerRepository extends JpaRepository<StatusTracker, Long> {
    // You can add custom queries if needed later
}