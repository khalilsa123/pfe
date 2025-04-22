package com.example.loginpfe.dto;



import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class NewPasswordRequest {

    // Getters et Setters
    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;

    // Constructeur par défaut
    public NewPasswordRequest() {}

    // Constructeur avec paramètres
    public NewPasswordRequest(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

}
