package com.dmp.api_and_auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.InMemoryReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;

@Configuration
public class OAuth2ClientConfig {

    @Bean
    public ReactiveClientRegistrationRepository clientRegistrations() {
        ClientRegistration googleRegistration = CommonOAuth2Provider.GOOGLE
                .getBuilder("google")
                .clientId("")
                .clientSecret("")
                .redirectUri("http://localhost:8083/login/oauth2/code/google")
                .scope("openid", "profile", "email")
                .build();

        return new InMemoryReactiveClientRegistrationRepository(googleRegistration);
    }
}
