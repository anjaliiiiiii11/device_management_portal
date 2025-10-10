//package com.dmp.api_and_auth.security;
//
//import com.dmp.api_and_auth.service.JwtService;
//import com.dmp.api_and_auth.service.UserDetailsServiceImpl;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//
//import java.io.IOException;
//import java.util.Collections;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.*;
//
//class JwtAuthenticationFilterTest {
//
//    private JwtService jwtService;
//    private UserDetailsServiceImpl userDetailsService;
//    private JwtAuthenticationFilter jwtAuthenticationFilter;
//
//    @BeforeEach
//    void setUp() {
//        jwtService = mock(JwtService.class);
//        userDetailsService = mock(UserDetailsServiceImpl.class);
//        jwtAuthenticationFilter = new JwtAuthenticationFilter();
//
//        // Manually inject mocks
//        jwtAuthenticationFilter.jwtService = jwtService;
//        jwtAuthenticationFilter.userDetailsService = userDetailsService;
//
//        // Clear security context before each test
//        SecurityContextHolder.clearContext();
//    }
//
//    @Test
//    void testDoFilterInternal_withValidToken_setsAuthentication() throws ServletException, IOException {
//        HttpServletRequest request = mock(HttpServletRequest.class);
//        HttpServletResponse response = mock(HttpServletResponse.class);
//        FilterChain filterChain = mock(FilterChain.class);
//
//        String token = "valid.jwt.token";
//        String email = "user@example.com";
//
//        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
//        when(jwtService.extractUsername(token)).thenReturn(email);
//
//        UserDetails userDetails = new User(email, "password", Collections.emptyList());
//        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
//        when(jwtService.isTokenValid(token, userDetails)).thenReturn(true);
//
//        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
//
//        var authentication = SecurityContextHolder.getContext().getAuthentication();
//        assertNotNull(authentication);
//        assertEquals(email, ((UserDetails) authentication.getPrincipal()).getUsername());
//
//        verify(filterChain, times(1)).doFilter(request, response);
//    }
//
//    @Test
//    void testDoFilterInternal_withNoAuthorizationHeader_skipsAuthentication() throws ServletException, IOException {
//        HttpServletRequest request = mock(HttpServletRequest.class);
//        HttpServletResponse response = mock(HttpServletResponse.class);
//        FilterChain filterChain = mock(FilterChain.class);
//
//        when(request.getHeader("Authorization")).thenReturn(null);
//
//        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
//
//        assertNull(SecurityContextHolder.getContext().getAuthentication());
//        verify(filterChain, times(1)).doFilter(request, response);
//    }
//
//    @Test
//    void testDoFilterInternal_withInvalidToken_doesNotSetAuthentication() throws ServletException, IOException {
//        HttpServletRequest request = mock(HttpServletRequest.class);
//        HttpServletResponse response = mock(HttpServletResponse.class);
//        FilterChain filterChain = mock(FilterChain.class);
//
//        String token = "invalid.jwt.token";
//        String email = "user@example.com";
//
//        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
//        when(jwtService.extractUsername(token)).thenReturn(email);
//
//        UserDetails userDetails = new User(email, "password", Collections.emptyList());
//        when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);
//        when(jwtService.isTokenValid(token, userDetails)).thenReturn(false);
//
//        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);
//
//        assertNull(SecurityContextHolder.getContext().getAuthentication());
//        verify(filterChain, times(1)).doFilter(request, response);
//    }
//}
