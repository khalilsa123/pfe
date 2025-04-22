package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.UserRepository;
import com.example.loginpfe.dto.NewPasswordRequest;
import com.example.loginpfe.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public boolean changePassword(String email, String oldPassword, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email); // Utilisez findByEmail au lieu de findById
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        return false;
    }
    public void updatePassword(String email, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
        } else {
            throw new RuntimeException("Utilisateur non trouvé");
        }
    }


    public void updatePassword1(NewPasswordRequest request) {
        System.out.println("request:" + request);
        String token = request.getToken();
        System.out.println("token " + token);
        Optional<User> optionalUser = userRepository.findByResetToken(token);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Encodez le nouveau mot de passe
            String encodedPassword = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(encodedPassword);

            // Réinitialisez le token
            user.setResetToken(null); // Suppression du token après utilisation
            userRepository.save(user); // Sauvegarder les changements
        } else {
            throw new RuntimeException("Invalid token or user not found");
        }
    }
}
