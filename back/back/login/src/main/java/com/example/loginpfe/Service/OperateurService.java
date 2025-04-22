package com.example.loginpfe.Service;

import com.example.loginpfe.entity.Operateur;
import com.example.loginpfe.exceptions.OperateurNotFoundException;
import com.example.loginpfe.Repository.OperateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class OperateurService {

    private final OperateurRepository operateurRepository;

    public OperateurService(OperateurRepository operateurRepository) {
        this.operateurRepository = operateurRepository;
    }

    // --- Gestion des opérateurs ---

    // Créer un nouvel opérateur (géré par SUPERVISEUR ou ADMIN)
    public Operateur creerOperateur(Operateur operateur) {
        if (operateurRepository.existsByMatricule(operateur.getMatricule())) {
            throw new IllegalArgumentException("Matricule déjà existant.");
        }
        return operateurRepository.save(operateur);
    }

    // Récupérer un opérateur par son identifiant
    public Operateur getOperateurById(Long id) {
        return operateurRepository.findById(id)
                .orElseThrow(() -> new OperateurNotFoundException(id));
    }

    // Liste des opérateurs actifs
    public List<Operateur> listerOperateursActifs() {
        return operateurRepository.findByActifTrue();
    }

    // --- Gestion du comptage ---

    // Enregistrer un comptage : incrémente le compteur pour chaque opérateur dont l'ID est fourni.
    public void enregistrerComptage(List<Long> operateursIds) {
        operateursIds.forEach(id -> {
            Operateur op = getOperateurById(id);
            op.incrementerComptage();
            operateurRepository.save(op);
        });
    }

    // Modifier manuellement le comptage d'un opérateur en définissant une nouvelle valeur.
    public Operateur modifierComptage(Long id, int nouvelleValeur) {
        Operateur operateur = getOperateurById(id);
        operateur.setNombreComptagesEffectues(nouvelleValeur);
        return operateurRepository.save(operateur);
    }

    // Réinitialiser le comptage (mettre le compteur à zéro) pour un opérateur.
    public Operateur resetComptage(Long id) {
        return modifierComptage(id, 0);
    }

    // Récupérer le nombre actuel de comptages pour un opérateur.
    public int getNombreComptages(Long id) {
        return getOperateurById(id).getNombreComptagesEffectues();
    }
}
