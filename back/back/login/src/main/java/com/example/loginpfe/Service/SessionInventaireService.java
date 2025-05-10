// src/main/java/com/example/loginpfe/Service/SessionInventaireService.java
package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.ComptageRepository;
import com.example.loginpfe.Repository.SessionInventaireRepository;
import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.entity.SessionInventaire;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Associe à cette session tous les comptages non affectés
     * dont le timestamp est entre dateDebut et dateFin.
     */
    @Transactional
    public SessionInventaire populateSession(Long sessionId) {
        // 1) Charger la session
        SessionInventaire sess = findById(sessionId);

        // 2) Calculer la plage de dates
        LocalDateTime start = sess.getDateDebut().atStartOfDay();
        LocalDateTime end = sess.getDateFin().atTime(23, 59, 59);

        // 3) Récupérer les comptages non liés et dans la plage
        List<Comptage> nouveaux = comptageRepo
                .findBySessionIsNullAndTimestampBetween(start, end);

        // 4) Vider l’ancienne liste (pour orphanRemoval)
        sess.getComptages().clear();

        // 5) Associer chaque comptage à la session
        for (Comptage c : nouveaux) {
            c.setSession(sess);
            sess.getComptages().add(c);
        }

        // 6) Sauvegarder et renvoyer la session enrichie
        return sessionRepo.save(sess);
    }
}
