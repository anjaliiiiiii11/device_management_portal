package com.dmp.api_and_auth.controller;

import com.dmp.api_and_auth.dto.AuthRequest;
import com.dmp.api_and_auth.dto.AuthResponse;
import com.dmp.api_and_auth.dto.RegisterRequest;
import com.dmp.api_and_auth.model.Users;
import com.dmp.api_and_auth.service.AuthService;
import com.dmp.api_and_auth.service.JwtService;
import com.netflix.discovery.converters.Auto;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LogManager.getLogger(AuthController.class);
    private final AuthService authService;

    @Autowired
    JwtService jwtService;

    // ✅ Constructor injection for testability
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        logger.info("Registering user with email: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        logger.debug("Registration successful for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        logger.info("Authenticating user with email: {}", request.getEmail());
        AuthResponse response = authService.authenticate(request);
        logger.debug("Authentication successful for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, String>> getProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtService.extractUsername(token);
        String username = jwtService.extractClaim(token, claims -> claims.get("username", String.class));
        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

        Map<String, String> profile = new HashMap<>();
        profile.put("email", email);
        profile.put("username", username);
        profile.put("role", role);

        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/changepassword")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");

        authService.updatePassword(email, newPassword);
        return ResponseEntity.ok("Password updated successfully");
    }


}
