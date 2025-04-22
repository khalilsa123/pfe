package com.example.loginpfe.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    JwtAuthFilter jwtAuthFilter;

    @Autowired
    UserDetailsServiceImpl userDetailsServiceImpl;

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {
        http
                // Désactivation du CSRF pour les API stateless
                .csrf(csrf -> csrf.disable())
                // Application de la configuration CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Définition des règles d'autorisation sur les endpoints
                .authorizeHttpRequests(requests -> requests
                        // Les endpoints d'authentification sont accessibles sans token
                        .requestMatchers("/api/auth/**").permitAll()// ← updated
                        .requestMatchers("/auth/**").permitAll()//
                        .requestMatchers("/api/operateurs/**").permitAll()

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(HttpMethod.GET,  "/api/operateurs/**/comptage").permitAll()
                       .requestMatchers(HttpMethod.POST, "/api/operateurs/**/comptage").permitAll()
                   //     .requestMatchers("/api/operateurs/**").permitAll()
                    //   .requestMatchers("/auth/register", "/auth/login").permitAll()
                       // .requestMatchers( "/api/operateurs/comptage").permitAll()
                        //.requestMatchers("/api/auth/register", "/api/auth/login").permitAll()

                        // Tous les autres endpoints requièrent une authentification valide
                        .anyRequest().authenticated()
                )
                // Les sessions sont configurées en mode stateless (pas de session côté serveur)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Désactivation de l'affichage en mode frame (utile pour la console H2 ou autres)
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                // En cas d'échec d'authentification, renvoie un 401 Unauthorized
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                // Ajout du filtre JWT avant UsernamePasswordAuthenticationFilter pour valider le token
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Utilisation de BCrypt pour l'encodage des mots de passe
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        // Utiliser le service de chargement des détails utilisateur personnalisé
        authenticationProvider.setUserDetailsService(userDetailsServiceImpl);
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // Récupère l'AuthenticationManager configuré par Spring Security
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Autoriser toutes les origines (à restreindre en production)
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        // Autoriser les méthodes HTTP définies
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Autoriser tous les headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        // Permettre l'envoi des informations d'authentification (credentials)
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Appliquer cette configuration à tous les endpoints
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
