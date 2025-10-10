//package com.dmp.api_and_auth.config;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.context.annotation.Import;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//
//import static org.junit.jupiter.api.Assertions.*;
//
//@SpringBootTest
//@Import(SecurityConfig.class)
//class SecurityConfigIntegrationTest {
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private SecurityWebFilterChain securityWebFilterChain;
//
//    @Test
//    void testPasswordEncoderBean() {
//        assertNotNull(passwordEncoder, "PasswordEncoder should be loaded");
//        assertTrue(passwordEncoder instanceof org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder,
//                "PasswordEncoder should be BCryptPasswordEncoder");
//    }
//
//    @Test
//    void testSecurityWebFilterChainBean() {
//        assertNotNull(securityWebFilterChain, "SecurityWebFilterChain should be loaded");
//    }
//}
