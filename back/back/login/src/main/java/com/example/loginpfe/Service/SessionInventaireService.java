// src/main/java/com/example/loginpfe/Service/SessionInventaireService.java
package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.ComptageRepository;
import com.example.loginpfe.Repository.SessionInventaireRepository;
import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.entity.SessionInventaire;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessionInventaireService {

    private final SessionInventaireRepository sessionRepo;
    private final ComptageRepository comptageRepo;

    public SessionInventaireService(
            SessionInventaireRepository sessionRepo,
            ComptageRepository comptageRepo
    ) {
        this.sessionRepo = sessionRepo;
        this.comptageRepo = comptageRepo;
    }

    public SessionInventaire create(SessionInventaire session) {
        return sessionRepo.save(session);
    }

    public List<SessionInventaire> findAll() {
        return sessionRepo.findAll();
    }

    public SessionInventaire findById(Long id) {
        return sessionRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Session non trouvée : " + id));
    }

    public void delete(Long id) {
        sessionRepo.deleteById(id);
    }

    public SessionInventaire populateSession(Long sessionId) {
        SessionInventaire sess = findById(sessionId);

        LocalDateTime start = sess.getDateDebut().atStartOfDay();
        LocalDateTime end = sess.getDateFin().atTime(23, 59, 59);

        // Récupérer les comptages à associer
        List<Comptage> nouveaux = comptageRepo
                .findBySession_IdAndTimestampBetween(sessionId, start, end);

        // 1) Vider l’ancienne liste (même instance)
        sess.getComptages().clear();

        // 2) Pour chaque comptage, fixer la session puis ajouter dans la liste
        for (Comptage c : nouveaux) {
            c.setSession(sess);
            sess.getComptages().add(c);
        }

        // 3) Sauvegarder le tout
        return sessionRepo.save(sess);
    }

}
