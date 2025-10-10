//package com.dmp.api_and_auth.controller;
//
//import com.dmp.api_and_auth.dto.AuthRequest;
//import com.dmp.api_and_auth.dto.AuthResponse;
//import com.dmp.api_and_auth.dto.RegisterRequest;
//import com.dmp.api_and_auth.service.AuthService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.http.ResponseEntity;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class AuthControllerTest {
//
//    private AuthService authService;
//    private AuthController authController;
//
//    @BeforeEach
//    void setUp() {
//        authService = mock(AuthService.class); // ✅ Create mock
//        authController = new AuthController(authService); // ✅ Inject mock
//    }
//
//    @Test
//    void testRegister() {
//        RegisterRequest request = new RegisterRequest();
//        AuthResponse expectedResponse = new AuthResponse("register-token");
//
//        when(authService.register(request)).thenReturn(expectedResponse);
//
//        ResponseEntity<AuthResponse> response = authController.register(request);
//
//        assertNotNull(response);
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals("register-token", response.getBody().getToken());
//        verify(authService, times(1)).register(request);
//    }
//
//    @Test
//    void testLogin() {
//        AuthRequest request = new AuthRequest();
//        request.setEmail("test@example.com");
//        request.setPassword("password123");
//
//        AuthResponse expectedResponse = new AuthResponse("login-token");
//
//        when(authService.authenticate(request)).thenReturn(expectedResponse);
//
//        ResponseEntity<AuthResponse> response = authController.login(request);
//
//        assertNotNull(response);
//        assertEquals(200, response.getStatusCodeValue());
//        assertEquals("login-token", response.getBody().getToken());
//        verify(authService, times(1)).authenticate(request);
//    }
//}
