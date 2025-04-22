package com.example.loginpfe.dto;


import com.example.loginpfe.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String firstname;
    private String lastname; // Correction de lastame à lastname

    private User.Role role ;


    // Getter pour email

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    public User.Role getRole() {
        return role;
    }

    // Setter pour email
    public void setEmail(User.Role role) {
        this.role = role;
    }

    public String getFirstname() {
        return firstname;
    }


    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }


    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getemail() {
        return getemail();
    }

    // Getter pour status

}


