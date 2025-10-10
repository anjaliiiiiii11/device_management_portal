//package com.example.deviceservice.repository;
//
//import com.example.deviceservice.model.Device;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.context.TestPropertySource;
//
//import java.time.LocalDate;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@ActiveProfiles("test")
//@TestPropertySource(locations = "classpath:application-test.properties")
//@DataJpaTest
//class DeviceRepositoryTest {
//
//    @Autowired
//    private DeviceRepository deviceRepo;
//
//    @Test
//    void testSaveAndFindById() {
//        Device device = new Device();
//        device.setDeviceID("TEL001");
//        device.setName("TestDevice");
//        device.setType("Phone");
//        device.setManufacturer("TestCorp");
//        device.setPurchaseDate(LocalDate.now());
//        device.setCreatedOn(LocalDate.now());
//        device.setLastUpdate(LocalDate.now());
//        device.setOwnerID("owner1");
//        device.setStatus("active");
//        device.setSoftDeleted(false);
//
//        deviceRepo.save(device);
//
//        Device found = deviceRepo.findById("TEL001").orElse(null);
//        assertNotNull(found);
//        assertEquals("TestDevice", found.getName());
//    }
//
//    @Test
//    void testFindBySoftDeletedFalse() {
//        Device device1 = new Device();
//        device1.setDeviceID("TEL002");
//        device1.setSoftDeleted(false);
//        deviceRepo.save(device1);
//
//        Device device2 = new Device();
//        device2.setDeviceID("TEL003");
//        device2.setSoftDeleted(true);
//        deviceRepo.save(device2);
//
//        List<Device> activeDevices = deviceRepo.findBySoftDeletedFalse();
//        assertEquals(1, activeDevices.size());
//        assertEquals("TEL002", activeDevices.get(0).getDeviceID());
//    }
//
//    @Test
//    void testFindByTypeAndManufacturerAndOwnerIDAndStatusAndPurchaseDateBetween() {
//        LocalDate now = LocalDate.now();
//        Device device = new Device();
//        device.setDeviceID("TEL004");
//        device.setType("Tablet");
//        device.setManufacturer("BrandX");
//        device.setOwnerID("owner2");
//        device.setStatus("active");
//        device.setPurchaseDate(now.minusDays(1));
//        deviceRepo.save(device);
//
//        List<Device> result = deviceRepo.findByTypeAndManufacturerAndOwnerIDAndStatusAndPurchaseDateBetween(
//                "Tablet", "BrandX", "owner2", "active", now.minusDays(2), now);
//
//        assertEquals(1, result.size());
//        assertEquals("TEL004", result.get(0).getDeviceID());
//    }
//
//    @Test
//    void testExistsById() {
//        Device device = new Device();
//        device.setDeviceID("TEL005");
//        deviceRepo.save(device);
//
//        assertTrue(deviceRepo.existsById("TEL005"));
//        assertFalse(deviceRepo.existsById("TEL999"));
//    }
//
//    @Test
//    void testFindAllByOrderByDeviceIDAsc() {
//        Device device1 = new Device();
//        device1.setDeviceID("TEL010");
//        deviceRepo.save(device1);
//
//        Device device2 = new Device();
//        device2.setDeviceID("TEL009");
//        deviceRepo.save(device2);
//
//        List<Device> sorted = deviceRepo.findAllByOrderByDeviceIDAsc();
//        assertEquals(2, sorted.size());
//        assertEquals("TEL009", sorted.get(0).getDeviceID());
//        assertEquals("TEL010", sorted.get(1).getDeviceID());
//    }
//}