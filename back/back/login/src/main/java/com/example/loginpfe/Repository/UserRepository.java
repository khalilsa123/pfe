// src/main/java/com/example/loginpfe/Repository/UserRepository.java
package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(User.Role role);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    List<User> findByTokenExpirationBefore(LocalDateTime now);
}

/**
 * package com.example.loginpfe.Repository;
 * <p>
 * import com.example.loginpfe.entity.User;
 * import org.springframework.data.jpa.repository.JpaRepository;
 * import org.springframework.stereotype.Repository;
 * <p>
 * import java.time.LocalDateTime;
 * import java.util.List;
 * import java.util.Optional;
 *
 * @Repository public interface UserRepository extends JpaRepository<User, Long> {
 * Optional<User> findByEmail(String email);
 * Optional<User> findByUsername(String username);
 * Optional<User> findById(int id);
 * List<User>  findByTokenExpirationBefore(LocalDateTime date) ;
 * Optional<User> findByResetToken(String token);
 * <p>
 * }
 */