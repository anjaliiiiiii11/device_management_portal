//package com.dmp.api_and_auth.security;
//
//import com.dmp.api_and_auth.service.JwtService;
//import com.dmp.api_and_auth.service.UserDetailsServiceImpl;
//import jakarta.servlet.*;
//import jakarta.servlet.http.*;
//import org.apache.logging.log4j.LogManager;
//import org.apache.logging.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.*;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Component
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//    private static final Logger logger = LogManager.getLogger(JwtAuthenticationFilter.class);
//
//    @Autowired
//    JwtService jwtService;
//
//    @Autowired
//    UserDetailsServiceImpl userDetailsService;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//
//        final String authHeader = request.getHeader("Authorization");
//        final String jwt;
//        final String userEmail;
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            logger.debug("No JWT token found in request header");
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        jwt = authHeader.substring(7);
//        logger.debug("JWT token extracted: {}", jwt);
//
//        userEmail = jwtService.extractUsername(jwt);
//        logger.debug("Extracted username from token: {}", userEmail);
//
//        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
//            var userDetails = userDetailsService.loadUserByUsername(userEmail);
//            if (jwtService.isTokenValid(jwt, userDetails)) {
//                logger.info("JWT token is valid for user: {}", userEmail);
//                var authToken = new UsernamePasswordAuthenticationToken(
//                        userDetails, null, userDetails.getAuthorities());
//                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                SecurityContextHolder.getContext().setAuthentication(authToken);
//                logger.debug("Authentication set in security context for user: {}", userEmail);
//            } else {
//                logger.warn("Invalid JWT token for user: {}", userEmail);
//            }
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}
