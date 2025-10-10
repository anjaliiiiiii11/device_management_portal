package com.dmp.api_and_auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaRepositories(basePackages = "com.dmp.api_and_auth.repository")
@EnableFeignClients
public class ApiAndAuthApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiAndAuthApplication.class, args);
	}

}
