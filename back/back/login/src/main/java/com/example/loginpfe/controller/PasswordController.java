package com.example.loginpfe.controller;
import com.example.loginpfe.Repository.UserRepository;
import com.example.loginpfe.Service.EmailService;
import com.example.loginpfe.Service.JwtService;
//import com.example.loginpfe.Service.PasswordGenerator;
import com.example.loginpfe.Service.UserService;
import com.example.loginpfe.dto.ChangePasswordRequest;
import com.example.loginpfe.dto.NewPasswordRequest;
import com.example.loginpfe.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class PasswordController {
    @Autowired
    private JwtService jwtService;

    @Autowired
    UserRepository userRepository ;
    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;
    @PutMapping("/modifier/{email}")
    public ResponseEntity<String> changePassword(
            @PathVariable String email,
            @RequestBody ChangePasswordRequest changePasswordRequest) {

        boolean isChanged = userService.changePassword(email,
                changePasswordRequest.getOldPassword(),
                changePasswordRequest.getNewPassword());

        if (isChanged) {
            return ResponseEntity.status(HttpStatus.OK).body("Password changed successfully");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid email or old password");
        }
    }
    @PostMapping("/reset-password/{email}")
    public String resetPassword(@PathVariable String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (!user.isPresent()) {
            return "No user found with this email.";
        }

        // Generate a random password
       // String newPassword = PasswordGenerator.generateRandomPassword(12); // Password length

        // Update the password in the database
       // userService.updatePassword(email, newPassword);

        // Send an email with the new password
        String subject = "Password Reset";
       // String message = "Your new password is: " + newPassword + "\n\n"
               // + "Please change this password after logging in.";
      //  emailService.sendEmail(email, subject, message);

        return "An email with a new password has been sent to your address.";
    }

    @PostMapping("/reset-password1/{email}")
    public String resetPassword1(@PathVariable String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Générer un token
            String token = String.valueOf(jwtService.generateToken(user));
            LocalDateTime tokenExpiration = LocalDateTime.now().plusMinutes(2);
            user.setResetToken(token);
            user.setTokenExpiration(tokenExpiration);
            userRepository.save(user);

            // Afficher l'utilisateur pour vérifier que le token est bien défini
            System.out.println("User after saving: " + user);

            // Envoyer l'e-mail
            String resetLink = "http://localhost:3000/reset-password1?token=" + token;
            emailService.sendEmail2(email, resetLink);

            return "Un lien de réinitialisation a été envoyé à votre email.";
        } else {
            return "No user found with this email.";
        }

    }


    @PostMapping("/new-password")
    public ResponseEntity<String> setNewPassword(@RequestBody NewPasswordRequest request) {
        userService.updatePassword1(request);
        return ResponseEntity.ok("Mot de passe mis à jour avec succès.");
    }



}

