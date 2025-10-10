package com.example.deviceservice.service;

import com.example.deviceservice.dto.OwnerDTO;
import com.example.deviceservice.model.Owner;
import com.example.deviceservice.repository.OwnerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OwnerServiceImplTest {

    @InjectMocks
    private OwnerServiceImpl ownerService;

    @Mock
    private OwnerRepository ownerRepo;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ✅ Positive: Register Owner
    @Test
    void testRegisterOwner_Success() {
        OwnerDTO input = new OwnerDTO(null, "John Doe", "john@example.com");
        Owner savedOwner = new Owner("OWN123456", "John Doe", "john@example.com");

        when(ownerRepo.existsById(anyString())).thenReturn(false);
        when(ownerRepo.save(any(Owner.class))).thenReturn(savedOwner);

        OwnerDTO result = ownerService.registerOwner(input);

        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals("john@example.com", result.getContactInfo());
    }

    // ✅ Positive: Get All Owners
    @Test
    void testGetAllOwners_Success() {
        List<Owner> owners = List.of(
                new Owner("OWN111111", "Alice", "alice@example.com"),
                new Owner("OWN222222", "Bob", "bob@example.com")
        );

        when(ownerRepo.findAll()).thenReturn(owners);

        List<OwnerDTO> result = ownerService.getAllOwners();

        assertEquals(2, result.size());
        assertEquals("Alice", result.get(0).getName());
        assertEquals("Bob", result.get(1).getName());
    }

    // ✅ Positive: Get Owner by ID
    @Test
    void testGetOwnerById_Success() {
        Owner owner = new Owner("OWN123456", "Charlie", "charlie@example.com");

        when(ownerRepo.findById("OWN123456")).thenReturn(Optional.of(owner));

        OwnerDTO result = ownerService.getOwnerById("OWN123456");

        assertEquals("Charlie", result.getName());
        assertEquals("charlie@example.com", result.getContactInfo());
    }

    // ❌ Negative: Get Owner by ID Not Found
    @Test
    void testGetOwnerById_NotFound() {
        when(ownerRepo.findById("OWN000000")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> ownerService.getOwnerById("OWN000000"));
        assertEquals("Owner not found", ex.getMessage());
    }

    // ✅ Positive: Partial Update
    @Test
    void testPartiallyUpdateOwner_Success() {
        Owner existing = new Owner("OWN123456", "David", "david@example.com");
        Owner updated = new Owner("OWN123456", "Dave", "dave@example.com");

        OwnerDTO updateDTO = new OwnerDTO(null, "Dave", "dave@example.com");

        when(ownerRepo.findById("OWN123456")).thenReturn(Optional.of(existing));
        when(ownerRepo.save(any(Owner.class))).thenReturn(updated);

        OwnerDTO result = ownerService.partiallyUpdateOwner("OWN123456", updateDTO);

        assertEquals("Dave", result.getName());
        assertEquals("dave@example.com", result.getContactInfo());
    }

    // ❌ Negative: Partial Update Owner Not Found
    @Test
    void testPartiallyUpdateOwner_NotFound() {
        OwnerDTO updateDTO = new OwnerDTO(null, "Dave", "dave@example.com");

        when(ownerRepo.findById("OWN000000")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.partiallyUpdateOwner("OWN000000", updateDTO));

        assertEquals("Owner not found", ex.getMessage());
    }

    // ✅ Positive: Delete Owner
    @Test
    void testDeleteOwner_Success() {
        when(ownerRepo.existsById("OWN123456")).thenReturn(true);

        ownerService.deleteOwner("OWN123456");

        verify(ownerRepo, times(1)).deleteById("OWN123456");
    }

    // ❌ Negative: Delete Owner Not Found
    @Test
    void testDeleteOwner_NotFound() {
        when(ownerRepo.existsById("OWN000000")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                ownerService.deleteOwner("OWN000000"));

        assertEquals("Owner not found", ex.getMessage());
    }
}