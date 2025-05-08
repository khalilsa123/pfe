/**

package com.example.loginpfe.Service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class WebSecurityConfig {


    @Bean(name = "bCryptPasswordEncoder")

    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Ne pas ajouter de configuration SecurityFilterChain ici
    // car cela créerait un conflit avec SecurityConfig.java
}*/