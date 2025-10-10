package com.dmp.api_and_auth.service;

import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Base64;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Set a test secret key (must be at least 256 bits for HS256)
        String rawKey = "mytestsecretkeymytestsecretkeymytestsecretkey12"; // 256-bit
        String encodedKey = Base64.getEncoder().encodeToString(rawKey.getBytes());
        jwtService.secretKey = encodedKey;
    }

    @Test
    void testGenerateAndExtractUsername() {
        String username = "testuser";
        String token = jwtService.generateToken(username);

        assertNotNull(token);
        String extractedUsername = jwtService.extractUsername(token);
        assertEquals(username, extractedUsername);
    }

    @Test
    void testIsTokenValid() {
        String username = "validuser";
        UserDetails userDetails = new User(username, "password", Collections.emptyList());
        String token = jwtService.generateToken(username);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void testIsTokenInvalidForWrongUser() {
        String token = jwtService.generateToken("userA");
        UserDetails userDetails = new User("userB", "password", Collections.emptyList());

        assertFalse(jwtService.isTokenValid(token, userDetails));
    }
}
