package com.example.loginpfe.dto;

public class UserResponse {
    private String username;


    private String firstname;
    private String lastname;
    private String role;
    private long id ;



    // Constructeur
    public UserResponse(String username ,String firstname, String lastname, String role,long id) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
        this.id = id ;
    }
    public long getId() {
        return id;
    }
    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public void setId(long id) {
        this.id = id;
    }
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
}