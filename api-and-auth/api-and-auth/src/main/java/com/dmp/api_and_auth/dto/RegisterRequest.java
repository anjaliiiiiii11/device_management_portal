package com.dmp.api_and_auth.dto;

import lombok.*;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
}
