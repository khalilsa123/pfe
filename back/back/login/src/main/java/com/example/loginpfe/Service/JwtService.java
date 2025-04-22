package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.UserRepository;
import com.example.loginpfe.dto.AuthResponse;
import com.example.loginpfe.dto.UserResponse;
import com.example.loginpfe.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
public class JwtService {
    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationDuration;  // en ms

    public AuthResponse generateToken(User user) {
        byte[] secretBytes = secret.getBytes();
        SecretKeySpec key = new SecretKeySpec(secretBytes, SignatureAlgorithm.HS256.getJcaName());

        String token = Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("firstname", user.getFirstname())
                .claim("lastname", user.getLastname())
                .setIssuedAt(new Date())
                // utilisation de expirationDuration
                .setExpiration(new Date(System.currentTimeMillis() + expirationDuration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        UserResponse userResponse = new UserResponse(
                user.getUsername(),
                user.getFirstname(),
                user.getLastname(),
                user.getRole().name(),
                user.getId()
                );

        return new AuthResponse(token, userResponse);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    @Scheduled(fixedRate = 60000)
    public void cleanExpiredTokens() {
        List<User> expired = userRepository.findByTokenExpirationBefore(LocalDateTime.now());
        for (User u : expired) {
            u.setResetToken(null);
            u.setTokenExpiration(null);
            userRepository.save(u);
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}

/**package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.UserRepository;
import com.example.loginpfe.dto.AuthResponse;
import com.example.loginpfe.dto.UserResponse;
import com.example.loginpfe.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Service
public class JwtService {
    @Autowired
    private UserRepository userRepository ;
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long expirationDuration;
    public AuthResponse generateToken(User user) {
        byte[] secretBytes = secret.getBytes();
        SecretKeySpec key = new SecretKeySpec(secretBytes, SignatureAlgorithm.HS256.getJcaName());

        String token = Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("firstname", user.getFirstname())
                .claim("lastname", user.getLastname())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationDuration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Créez un objet UserResponse avec les informations de l'utilisateur
        UserResponse userResponse = new UserResponse(
                user.getUsername(),
                user.getFirstname(),
                user.getLastname(),
                user.getRole().name()
        );

        // Retournez un objet AuthResponse contenant le token et les informations de l'utilisateur
        return new AuthResponse(token, userResponse);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes());

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token) // Décoder et valider le token
                .getBody(); // Extraire les claims
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }


    @Scheduled(fixedRate = 60000)
    public void cleanExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<User> usersWithExpiredTokens = userRepository.findByTokenExpirationBefore(now);

        for (User user : usersWithExpiredTokens) {
            user.setResetToken(null);
            user.setTokenExpiration(null);
            userRepository.save(user);
        }
    }
private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());}
}*/