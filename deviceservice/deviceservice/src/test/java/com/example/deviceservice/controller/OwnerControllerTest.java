//package com.example.deviceservice.controller;
//
//import com.example.deviceservice.dto.OwnerDTO;
//import com.example.deviceservice.service.OwnerService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.context.TestConfiguration;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Import;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.beans.factory.annotation.Autowired;
//
//import java.util.List;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@WebMvcTest(OwnerController.class)
//@Import(OwnerControllerTest.MockOwnerServiceConfig.class)
//class OwnerControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private OwnerService ownerService;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @TestConfiguration
//    static class MockOwnerServiceConfig {
//        @Bean
//        public OwnerService ownerService() {
//            return Mockito.mock(OwnerService.class);
//        }
//    }
//
//    @Test
//    void testCreateOwner_Success() throws Exception {
//        OwnerDTO input = new OwnerDTO(null, "John Doe", "john@example.com");
//        OwnerDTO output = new OwnerDTO("OWN123456", "John Doe", "john@example.com");
//
//        Mockito.when(ownerService.registerOwner(any(OwnerDTO.class))).thenReturn(output);
//
//        mockMvc.perform(post("/owners")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(input)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.ownerID").value("OWN123456"))
//                .andExpect(jsonPath("$.name").value("John Doe"))
//                .andExpect(jsonPath("$.contactInfo").value("john@example.com"));
//    }
//
//    @Test
//    void testGetAllOwners_Success() throws Exception {
//        List<OwnerDTO> owners = List.of(
//                new OwnerDTO("OWN111111", "Alice", "alice@example.com"),
//                new OwnerDTO("OWN222222", "Bob", "bob@example.com")
//        );
//
//        Mockito.when(ownerService.getAllOwners()).thenReturn(owners);
//
//        mockMvc.perform(get("/owners"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.length()").value(2))
//                .andExpect(jsonPath("$[0].name").value("Alice"))
//                .andExpect(jsonPath("$[1].name").value("Bob"));
//    }
//
//    @Test
//    void testGetOwnerById_Success() throws Exception {
//        OwnerDTO owner = new OwnerDTO("OWN123456", "Charlie", "charlie@example.com");
//
//        Mockito.when(ownerService.getOwnerById("OWN123456")).thenReturn(owner);
//
//        mockMvc.perform(get("/owners/OWN123456"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.name").value("Charlie"))
//                .andExpect(jsonPath("$.contactInfo").value("charlie@example.com"));
//    }
//
//    @Test
//    void testGetOwnerById_NotFound() throws Exception {
//        Mockito.when(ownerService.getOwnerById("OWN000000"))
//                .thenThrow(new RuntimeException("Owner not found"));
//
//        mockMvc.perform(get("/owners/OWN000000"))
//                .andExpect(status().isNotFound())
//                .andExpect(content().string("Owner not found"));
//
//    }
//
//    @Test
//    void testPartiallyUpdateOwner_Success() throws Exception {
//        OwnerDTO updateDTO = new OwnerDTO(null, "Dave", "dave@example.com");
//        OwnerDTO updatedOwner = new OwnerDTO("OWN123456", "Dave", "dave@example.com");
//
//        Mockito.when(ownerService.partiallyUpdateOwner(eq("OWN123456"), any(OwnerDTO.class)))
//                .thenReturn(updatedOwner);
//
//        mockMvc.perform(patch("/owners/OWN123456")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateDTO)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.name").value("Dave"))
//                .andExpect(jsonPath("$.contactInfo").value("dave@example.com"));
//    }
//
//    @Test
//    void testPartiallyUpdateOwner_NotFound() throws Exception {
//        OwnerDTO updateDTO = new OwnerDTO(null, "Dave", "dave@example.com");
//
//        Mockito.when(ownerService.partiallyUpdateOwner(eq("OWN000000"), any(OwnerDTO.class)))
//                .thenThrow(new RuntimeException("Owner not found"));
//
//        mockMvc.perform(patch("/owners/OWN000000")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateDTO)))
//                .andExpect(status().isNotFound())
//                .andExpect(content().string("Owner not found"));
//    }
//
//    @Test
//    void testDeleteOwner_Success() throws Exception {
//        Mockito.doNothing().when(ownerService).deleteOwner("OWN123456");
//
//        mockMvc.perform(delete("/owners/OWN123456"))
//                .andExpect(status().isOk());
//    }
//
//    @Test
//    void testDeleteOwner_NotFound() throws Exception {
//        Mockito.doThrow(new RuntimeException("Owner not found"))
//                .when(ownerService).deleteOwner("OWN000000");
//
//        mockMvc.perform(delete("/owners/OWN000000"))
//                .andExpect(status().isNotFound())
//                .andExpect(content().string("Owner not found"));
//    }
//}
