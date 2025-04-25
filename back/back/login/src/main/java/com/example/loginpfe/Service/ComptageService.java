package com.example.loginpfe.Service;

import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.Repository.ComptageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ComptageService {

    private final ComptageRepository comptageRepository;

    public ComptageService(ComptageRepository comptageRepository) {
        this.comptageRepository = comptageRepository;
    }

    /** Crée un nouveau comptage (opérateur renseigné en amont) */
    public Comptage ajouterComptage(Comptage comptage) {
        comptage.setTimestamp(LocalDateTime.now());
        return comptageRepository.save(comptage);
    }

    /** Modifie un comptage existant */
    public Comptage modifierComptage(Long id, Comptage newData) {
        return comptageRepository.findById(id)
                .map(c -> {
                    c.setEmplacement(newData.getEmplacement());
                    c.setReference(newData.getReference());
                    c.setNumLot(newData.getNumLot());
                    c.setNumSousLot(newData.getNumSousLot());
                    c.setTypeMatiere(newData.getTypeMatiere());
                    c.setPoids(newData.getPoids());
                    c.setQuantiteTotale(newData.getQuantiteTotale());
                    c.setNumComptage(newData.getNumComptage());
                    c.setTimestamp(LocalDateTime.now());
                    return comptageRepository.save(c);
                })
                .orElseThrow(() -> new RuntimeException("Comptage non trouvé avec id: " + id));
    }

    /** Supprime un comptage */
    public void supprimerComptage(Long id) {
        if (!comptageRepository.existsById(id)) {
            throw new RuntimeException("Comptage non trouvé avec id: " + id);
        }
        comptageRepository.deleteById(id);
    }

    /** Tous les comptages d’un opérateur */
    public List<Comptage> afficherComptagesParOperateur(Long operateurId) {
        return comptageRepository.findByOperateurId(operateurId);
    }

    /** **NOUVEAU** : liste **tous** les comptages en base */
    public List<Comptage> findAll() {
        return comptageRepository.findAll();
    }
}
