package com.example.loginpfe.Repository;

import com.example.loginpfe.entity.Comptage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ComptageRepository extends JpaRepository<Comptage, Long> {
    List<Comptage> findByOperateurId(Long operateurId);

    List<Comptage> findByReferenceAndNumComptage(String reference, int numComptage);

    List<Comptage> findBySession_IdAndTimestampBetween(Long sessionId, LocalDateTime start, LocalDateTime end);

}