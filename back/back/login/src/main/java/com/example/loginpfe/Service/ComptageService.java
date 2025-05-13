package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.ComptageRepository;
import com.example.loginpfe.entity.Comptage;
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

    /**
     * Crée un nouveau comptage (opérateur renseigné en amont)
     */
    public Comptage ajouterComptage(Comptage comptage) {
        comptage.setTimestamp(LocalDateTime.now());
        return comptageRepository.save(comptage);
    }

    /**
     * Modifie un comptage existant
     */
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

    /**
     * Récupère le nombre d'itérations pour un comptage spécifique
     */
    public int getIterationCount(String reference, int numComptage) {
        List<Comptage> comptages =
                comptageRepository.findByReferenceAndNumComptage(reference, numComptage);
        return comptages == null ? 0 : comptages.size();
    }

    /**
     * Affecte un comptage existant à un opérateur
     */
    public Comptage affecterComptage(Long comptageId, Long operateurId) {
        Comptage c = comptageRepository.findById(comptageId)
                .orElseThrow(() -> new RuntimeException("Comptage non trouvé : " + comptageId));
        c.setOperateurId(operateurId);
        return comptageRepository.save(c);
    }

    /**
     * Supprime un comptage
     */
    public void supprimerComptage(Long id) {
        if (!comptageRepository.existsById(id)) {
            throw new RuntimeException("Comptage non trouvé avec id: " + id);
        }
        comptageRepository.deleteById(id);
    }

    /**
     * Tous les comptages d'un opérateur
     */
    public List<Comptage> afficherComptagesParOperateur(Long operateurId) {
        return comptageRepository.findByOperateurId(operateurId);
    }

    /**
     * Liste les comptages non affectés dans une plage de dates
     */
    public List<Comptage> findUnassignedBetween(LocalDateTime start, LocalDateTime end) {
        List<Comptage> results =
                comptageRepository.findBySessionIsNullAndTimestampBetween(start, end);
        System.out.println("Found " + results.size() + " unassigned comptages between dates");
        return results;
    }

    /**
     * Liste tous les comptages en base
     */
    public List<Comptage> findAll() {
        List<Comptage> results = comptageRepository.findAll();
        System.out.println("ComptageService.findAll() - Found " + results.size() + " comptages");

        if (!results.isEmpty()) {
            for (int i = 0; i < Math.min(3, results.size()); i++) {
                Comptage c = results.get(i);
                System.out.println("Comptage[" + i + "]: id=" + c.getId() +
                        ", ref=" + c.getReference() +
                        ", numComptage=" + c.getNumComptage() +
                        ", operateurId=" + c.getOperateurId() +
                        ", poids=" + c.getPoids());
            }
        } else {
            System.out.println("WARNING: No comptages found in database!");
        }

        return results;
    }
}
 