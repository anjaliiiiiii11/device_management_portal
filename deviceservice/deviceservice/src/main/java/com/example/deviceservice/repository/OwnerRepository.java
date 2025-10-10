package com.example.deviceservice.repository;

import com.example.deviceservice.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, String> {
//    boolean existsById(String ownerID);
}
