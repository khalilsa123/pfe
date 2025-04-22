package com.example.loginpfe.controller;


import com.example.loginpfe.Repository.UserRepository;
import com.example.loginpfe.Service.JwtService;
import com.example.loginpfe.dto.AuthResponse;
import com.example.loginpfe.dto.ComptageDTO;
import com.example.loginpfe.dto.RegisterRequest;
import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.entity.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")        // ← was "/auth"
public class AuthController {

    private  UserRepository userRepository;
    private  JwtService jwtService;
    private  PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }
    @CrossOrigin(origins = "localhost:4200")

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest user) {
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User user2 = new User();
            user2.setUsername(user.getUsername());
            user2.setPassword(user.getPassword());
            user2.setFirstname(user.getFirstname());
            user2.setLastname(user.getLastname());
            user2.setRole(user.getRole());
            user2.setEmail("khalilsaidnai"); // Utilisation de l'email fourni

            User savedUser = userRepository.save(user2);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during registration");
        }
    }
    @CrossOrigin(origins = "localhost:4200")

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        User dbUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {

            AuthResponse authResponse = jwtService.generateToken(dbUser);
            return ResponseEntity.ok(authResponse);
        } else {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

}
