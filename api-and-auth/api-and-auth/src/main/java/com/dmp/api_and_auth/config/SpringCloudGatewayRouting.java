package com.dmp.api_and_auth.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Configuration
public class SpringCloudGatewayRouting {

    private static final Logger logger = LogManager.getLogger(SpringCloudGatewayRouting.class);

    @Bean
    public RouteLocator configureRoute(RouteLocatorBuilder builder) {
        logger.info("Configuring gateway routes for deviceservice");
        return builder.routes()
                .route("deviceId", r -> r.path("/devices/**").uri("lb://deviceservice"))
                .route("ownerId", r -> r.path("/owners/**").uri("lb://deviceservice"))
                .route("csvExport", r -> r.path("/export/csv").uri("lb://deviceservice"))
                .build();
    }
}
