package com.example.deviceservice.repository;

import com.example.deviceservice.model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, String> {


    List<Device> findBySoftDeletedFalse();

    @Query("SELECT d FROM Device d WHERE " +
            "(:deviceID IS NULL OR d.deviceID LIKE %:deviceID%) AND " +
            "(:type IS NULL OR d.type = :type) AND " +
            "(:manufacturer IS NULL OR d.manufacturer = :manufacturer) AND " +
            "(:ownerID IS NULL OR d.ownerID = :ownerID) AND " +
            "(:status IS NULL OR d.status = :status) AND " +
            "(:startDate IS NULL OR d.purchaseDate >= :startDate) AND " +
            "(:endDate IS NULL OR d.purchaseDate <= :endDate)")
    List<Device> filterDevices(
            @Param("deviceID") String deviceID,
            @Param("type") String type,
            @Param("manufacturer") String manufacturer,
            @Param("ownerID") String ownerID,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );



    // Used for ID generation
    boolean existsById(String deviceID);

    List<Device> findAllByOrderByDeviceIDAsc();
}
