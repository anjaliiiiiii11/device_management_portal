package com.dmp.api_and_auth.service;

import com.dmp.api_and_auth.model.Users;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private static final Logger logger = LogManager.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    protected String secretKey;

    private SecretKey getSignKey() {
        logger.debug("Decoding JWT secret key");
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Users user) {
        logger.info("Generating JWT token for user: {}", user.getEmail());
        String token = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("username", user.getUsername()) // Add username claim
                .claim("role", user.getRole()) // Add role claim
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
        logger.debug("JWT token generated successfully");
        return token;
    }

    public String extractUsername(String token) {
        logger.debug("Extracting username from token");
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        logger.debug("Extracting claim from token");
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        logger.info("Validating token for user: {}", userDetails.getUsername());
        final String username = extractUsername(token);
        boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        logger.debug("Token valid: {}", isValid);
        return isValid;
    }

    private boolean isTokenExpired(String token) {
        logger.debug("Checking if token is expired");
        boolean expired = extractClaim(token, Claims::getExpiration).before(new Date());
        logger.debug("Token expired: {}", expired);
        return expired;
    }
}
