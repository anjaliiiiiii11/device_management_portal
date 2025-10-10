package com.dmp.api_and_auth.config;

import com.dmp.api_and_auth.model.Users;
import com.dmp.api_and_auth.repository.UserRepository;
import com.dmp.api_and_auth.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.net.URI;

@Component
public class GoogleOAuth2SuccessHandler implements ServerAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public GoogleOAuth2SuccessHandler(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange,
                                              Authentication authentication) {
        ServerWebExchange exchange = webFilterExchange.getExchange();
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        return Mono.fromCallable(() -> {
                    Users user = userRepository.findByEmail(email)
                            .orElseGet(() -> userRepository.save(new Users(email, name, "USER")));

                    String jwt = jwtService.generateToken(user);

                    URI redirectUri = URI.create("http://localhost:3000/login-success?token=" + jwt);
                    exchange.getResponse().setStatusCode(HttpStatus.FOUND);
                    exchange.getResponse().getHeaders().setLocation(redirectUri);

                    return exchange.getResponse();
                })
                .subscribeOn(Schedulers.boundedElastic()) // run blocking code on separate thread
                .flatMap(response -> exchange.getResponse().setComplete());
    }

}
