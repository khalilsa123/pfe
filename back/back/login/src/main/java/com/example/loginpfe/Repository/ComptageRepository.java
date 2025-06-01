package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.Comptage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ComptageRepository extends JpaRepository<Comptage, Long> {
    List<Comptage> findByOperateurId(Long operateurId);

    // Cette méthode recherche maintenant par référence simple (pas la chaîne complète)
    List<Comptage> findByReferenceAndNumComptage(String reference, int numComptage);

    // Méthode alternative avec query personnalisée si besoin
    @Query("SELECT c FROM Comptage c WHERE c.reference = :reference AND c.numComptage = :numComptage")
    List<Comptage> findComptagesByReferenceAndNumComptage(@Param("reference") String reference, @Param("numComptage") int numComptage);

    List<Comptage> findBySessionIsNullAndTimestampBetween(LocalDateTime start, LocalDateTime end);
}