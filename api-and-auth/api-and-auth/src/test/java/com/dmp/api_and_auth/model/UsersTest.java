//package com.dmp.api_and_auth.model;
//
//import org.junit.jupiter.api.Test;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//class UsersTest {
//
//    @Test
//    void testUsersSettersAndGetters() {
//        Users user = new Users();
//        user.setId(1L);
//        user.setUsername("testuser");
//        user.setEmail("test@example.com");
//        user.setPassword("securePassword");
//        user.setRole("USER");
//
//        assertEquals(1L, user.getId());
//        assertEquals("testuser", user.getUsername());
//        assertEquals("test@example.com", user.getEmail());
//        assertEquals("securePassword", user.getPassword());
//        assertEquals("USER", user.getRole());
//    }
//
//    @Test
//    void testUsersAllArgsConstructor() {
//        Users user = new Users(2L, "admin", "admin@example.com", "adminPass", "ADMIN");
//
//        assertEquals(2L, user.getId());
//        assertEquals("admin", user.getUsername());
//        assertEquals("admin@example.com", user.getEmail());
//        assertEquals("adminPass", user.getPassword());
//        assertEquals("ADMIN", user.getRole());
//    }
//
//    @Test
//    void testUsersBuilder() {
//        Users user = Users.builder()
//                .id(3L)
//                .username("builderUser")
//                .email("builder@example.com")
//                .password("builderPass")
//                .role("BUILDER")
//                .build();
//
//        assertEquals(3L, user.getId());
//        assertEquals("builderUser", user.getUsername());
//        assertEquals("builder@example.com", user.getEmail());
//        assertEquals("builderPass", user.getPassword());
//        assertEquals("BUILDER", user.getRole());
//    }
//}
