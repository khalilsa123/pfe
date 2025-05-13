package com.example.loginpfe.dto;

public class UserResponse {
    private String username;
    private String firstname;
    private String lastname;
    private String role;
    private long id;
    private Integer defaultComptageType;

    // Updated constructor with defaultComptageType
    public UserResponse(String username, String firstname, String lastname, String role, long id, Integer defaultComptageType) {
        this.username = username;
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
        this.id = id;
        this.defaultComptageType = defaultComptageType;
    }

    // Backward compatibility constructor
    public UserResponse(String username, String firstname, String lastname, String role, long id) {
        this(username, firstname, lastname, role, id, null);
    }

    public UserResponse(String username, String firstname, String lastname, String name, Long id, Object o, Integer defaultComptageType) {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
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

    // New getter and setter for defaultComptageType
    public Integer getDefaultComptageType() {
        return defaultComptageType;
    }

    public void setDefaultComptageType(Integer defaultComptageType) {
        this.defaultComptageType = defaultComptageType;
    }
}