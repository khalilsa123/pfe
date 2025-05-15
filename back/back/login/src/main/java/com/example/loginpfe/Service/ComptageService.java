package com.example.loginpfe.Service;

import com.example.loginpfe.Repository.ComptageRepository;
import com.example.loginpfe.entity.Comptage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ComptageService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final ComptageRepository comptageRepository;

    public ComptageService(ComptageRepository comptageRepository) {
        this.comptageRepository = comptageRepository;
    }

    /**
     * Crée un nouveau comptage (opérateur renseigné en amont)
     */
    public Comptage ajouterComptage(Comptage comptage) {
        comptage.setTimestamp(LocalDateTime.now());
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.ajouterComptage - Adding new comptage: " +
                "reference=" + comptage.getReference() + ", numComptage=" + comptage.getNumComptage());

        Comptage saved = comptageRepository.save(comptage);
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.ajouterComptage - Saved with ID: " + saved.getId());
        return saved;
    }

    /**
     * Modifie un comptage existant
     */
    public Comptage modifierComptage(Long id, Comptage newData) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.modifierComptage - Updating comptage ID: " + id);
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
                    Comptage updated = comptageRepository.save(c);
                    System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.modifierComptage - Successfully updated");
                    return updated;
                })
                .orElseThrow(() -> {
                    System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.modifierComptage - ERROR: Comptage not found: " + id);
                    return new RuntimeException("Comptage non trouvé avec id: " + id);
                });
    }

    /**
     * Récupère le nombre d'itérations pour un comptage spécifique
     */
    public int getIterationCount(String reference, int numComptage) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.getIterationCount - Checking iterations for reference: " +
                reference + ", numComptage: " + numComptage);

        List<Comptage> comptages = comptageRepository.findByReferenceAndNumComptage(reference, numComptage);
        int count = comptages == null ? 0 : comptages.size();

        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.getIterationCount - Found " + count + " iterations");
        return count;
    }

    /**
     * Affecte un comptage existant à un opérateur
     */
    public Comptage affecterComptage(Long comptageId, Long operateurId) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.affecterComptage - Assigning comptage " +
                comptageId + " to operator " + operateurId);

        Comptage c = comptageRepository.findById(comptageId)
                .orElseThrow(() -> {
                    System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.affecterComptage - ERROR: Comptage not found: " + comptageId);
                    return new RuntimeException("Comptage non trouvé : " + comptageId);
                });
        c.setOperateurId(operateurId);
        Comptage updated = comptageRepository.save(c);
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.affecterComptage - Successfully assigned");
        return updated;
    }

    /**
     * Supprime un comptage
     */
    public void supprimerComptage(Long id) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.supprimerComptage - Deleting comptage: " + id);

        if (!comptageRepository.existsById(id)) {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.supprimerComptage - ERROR: Comptage not found: " + id);
            throw new RuntimeException("Comptage non trouvé avec id: " + id);
        }
        comptageRepository.deleteById(id);
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.supprimerComptage - Successfully deleted");
    }

    /**
     * Tous les comptages d'un opérateur
     */
    public List<Comptage> afficherComptagesParOperateur(Long operateurId) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.afficherComptagesParOperateur - Getting comptages for operator: " + operateurId);

        List<Comptage> results = comptageRepository.findByOperateurId(operateurId);
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.afficherComptagesParOperateur - Found " +
                results.size() + " comptages for operator");
        return results;
    }

    /**
     * Liste les comptages non affectés dans une plage de dates
     */
    public List<Comptage> findUnassignedBetween(LocalDateTime start, LocalDateTime end) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findUnassignedBetween - Searching unassigned comptages between " +
                start.format(TIME_FORMATTER) + " and " + end.format(TIME_FORMATTER));

        List<Comptage> results = comptageRepository.findBySessionIsNullAndTimestampBetween(start, end);
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findUnassignedBetween - Found " +
                results.size() + " unassigned comptages between dates");
        return results;
    }

    /**
     * Liste tous les comptages en base
     */
    public List<Comptage> findAll() {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findAll - Retrieving all comptages");

        List<Comptage> results = comptageRepository.findAll();
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findAll - Found " + results.size() + " comptages");

        if (!results.isEmpty()) {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findAll - Sample comptages:");
            for (int i = 0; i < Math.min(3, results.size()); i++) {
                Comptage c = results.get(i);
                System.out.println("  Comptage[" + i + "]: id=" + c.getId() +
                        ", ref=" + c.getReference() +
                        ", numComptage=" + c.getNumComptage() +
                        ", operateurId=" + c.getOperateurId() +
                        ", poids=" + c.getPoids());

                // Analyze reference format
                String reference = c.getReference();
                if (reference != null) {
                    String[] parts = reference.split("\\$");
                    System.out.println("    Reference analysis: parts=" + parts.length +
                            ", format=" + (parts.length >= 4 ? "valid" : "INVALID") +
                            ", full=" + reference);
                } else {
                    System.out.println("    Reference is NULL!");
                }
            }
        } else {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findAll - WARNING: No comptages found in database!");
        }

        return results;
    }
}