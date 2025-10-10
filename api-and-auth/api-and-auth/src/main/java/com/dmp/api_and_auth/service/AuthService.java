package com.dmp.api_and_auth.service;

import com.dmp.api_and_auth.dto.AuthRequest;
import com.dmp.api_and_auth.dto.AuthResponse;
import com.dmp.api_and_auth.dto.RegisterRequest;
import com.dmp.api_and_auth.model.Users;
import com.dmp.api_and_auth.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LogManager.getLogger(AuthService.class);

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtService jwtService;

    public String encodePassword(String rawPassword) {
        logger.debug("Encoding password");
        return passwordEncoder.encode(rawPassword);
    }

    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering user with email: {}", request.getEmail());

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        Users savedUser = userRepository.save(user);
        logger.debug("User saved: {}", savedUser);

        String token = jwtService.generateToken(savedUser); // Pass Users object
        logger.info("JWT token generated for user: {}", savedUser.getEmail());

        return new AuthResponse(token);
    }

    public AuthResponse authenticate(AuthRequest request) {
        logger.info("Authenticating user with email: {}", request.getEmail());

        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.error("User not found with email: {}", request.getEmail());
                    return new RuntimeException("Invalid credentials");
                });

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.debug("Password match successful for user: {}", request.getEmail());
            String token = jwtService.generateToken(user); // Pass Users object
            logger.info("JWT token generated for authenticated user: {}", user.getEmail());
            return new AuthResponse(token);
        }

        logger.warn("Password mismatch for user: {}", request.getEmail());
        throw new RuntimeException("Invalid credentials");
    }

    public void updatePassword(String email, String newPassword) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password updated for user: {}", email);
    }

    public Users getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}