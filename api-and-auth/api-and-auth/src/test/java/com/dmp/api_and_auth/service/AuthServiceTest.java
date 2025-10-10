package com.dmp.api_and_auth.service;

import com.dmp.api_and_auth.dto.AuthRequest;
import com.dmp.api_and_auth.dto.AuthResponse;
import com.dmp.api_and_auth.dto.RegisterRequest;
import com.dmp.api_and_auth.model.Users;
import com.dmp.api_and_auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtService = mock(JwtService.class);
        authService = new AuthService();

        // Manually inject mocks
        authService.userRepository = userRepository;
        authService.passwordEncoder = passwordEncoder;
        authService.jwtService = jwtService;
    }

    @Test
    void testEncodePassword() {
        String rawPassword = "password123";
        String encodedPassword = "encodedPassword123";

        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);

        String result = authService.encodePassword(rawPassword);
        assertEquals(encodedPassword, result);
    }

    @Test
    void testRegister() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        String encodedPassword = "encodedPassword123";
        String token = "jwt-token";

        when(passwordEncoder.encode("password123")).thenReturn(encodedPassword);
        when(jwtService.generateToken("test@example.com")).thenReturn(token);

        AuthResponse response = authService.register(request);

        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
        verify(userRepository).save(userCaptor.capture());

        Users savedUser = userCaptor.getValue();
        assertEquals("testuser", savedUser.getUsername());
        assertEquals("test@example.com", savedUser.getEmail());
        assertEquals(encodedPassword, savedUser.getPassword());
        assertEquals("USER", savedUser.getRole());

        assertEquals(token, response.getToken());
    }

    @Test
    void testAuthenticate_withValidCredentials() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        Users user = new Users();
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken("test@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.authenticate(request);

        assertEquals("jwt-token", response.getToken());
    }

    @Test
    void testAuthenticate_withInvalidCredentials_throwsException() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongPassword");

        Users user = new Users();
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticate(request);
        });

        assertEquals("Invalid credentials", exception.getMessage());
    }
}
