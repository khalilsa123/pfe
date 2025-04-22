package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.User;
//import com.example.loginpfe.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findById(Long id);
    List<User> findByTokenExpirationBefore(LocalDateTime date);
    Optional<User> findByResetToken(String token);

    // Nouveau : recherche des utilisateurs par rôle
    List<User> findByRole(User.Role role);
}

/**package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findById(int id);
    List<User>  findByTokenExpirationBefore(LocalDateTime date) ;
    Optional<User> findByResetToken(String token);

}*/
