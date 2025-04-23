/**
package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.Operateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OperateurRepository extends JpaRepository<Operateur, Long> {
    List<Operateur> findByActifTrue();
    boolean existsByMatricule(String matricule);
}
*/