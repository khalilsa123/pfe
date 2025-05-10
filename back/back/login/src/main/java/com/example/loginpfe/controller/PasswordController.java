// src/main/java/com/example/loginpfe/controller/PasswordController.java
package com.example.loginpfe.controller;

import com.example.loginpfe.Repository.UserRepository;
import com.example.loginpfe.dto.ChangePasswordRequest;
import com.example.loginpfe.entity.User;
import com.example.loginpfe.entity.User.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class PasswordController {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    public PasswordController(UserRepository userRepository,
                              org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Change password with role-based permissions:
     * - SUPERVISEUR can update OPERATEUR passwords
     * - ADMIN can update SUPERVISEUR and OPERATEUR passwords
     */
    @PutMapping("/updatepassword/{id}")
    public ResponseEntity<Void> changePassword(
            @PathVariable("id") Long targetId,
            @RequestBody ChangePasswordRequest body,
            Principal principal
    ) {
        // Get current user from JWT principal
        User currentUser = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid authenticated user"));

        // Load target user
        User targetUser = userRepository.findById(targetId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Target user not found"));

        Role currRole = currentUser.getRole();
        Role targetRole = targetUser.getRole();

        // Permission checks
        if (currRole == Role.SUPERVISEUR) {
            if (targetRole != Role.OPERATEUR) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Superviseur can only update opérateur passwords"
                );
            }
        } else if (currRole == Role.ADMIN) {
            if (targetRole != Role.OPERATEUR && targetRole != Role.SUPERVISEUR) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Admin can only update opérateur or superviseur passwords"
                );
            }
        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Opérateur cannot update other users' passwords"
            );
        }

        // Update and save
        targetUser.setPassword(passwordEncoder.encode(body.getNewPassword()));
        userRepository.save(targetUser);

        return ResponseEntity.ok().build();
    }
}
