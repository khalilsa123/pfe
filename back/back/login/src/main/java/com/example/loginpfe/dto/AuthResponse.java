package com.example.loginpfe.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {
    // Getters et Setters
    private String access_token;
    private UserResponse user;

    // Constructeur
    public AuthResponse(String access_token, UserResponse user) {
        this.access_token = access_token;
        this.user = user;
    }

}
