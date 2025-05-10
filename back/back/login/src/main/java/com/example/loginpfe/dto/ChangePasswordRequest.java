// src/main/java/com/example/loginpfe/dto/ChangePasswordRequest.java
package com.example.loginpfe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class ChangePasswordRequest {
    @NotBlank
    @JsonProperty("password")
    private String newPassword;

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}