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
     * Méthode utilitaire pour parser la référence complète
     */
    private void parseAndSetReferenceData(Comptage comptage, String fullReference) {
        if (fullReference == null || fullReference.trim().isEmpty()) {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.parseAndSetReferenceData - WARNING: Empty reference provided");
            return;
        }

        // Séparer par $ ou #
        String[] parts = fullReference.split("[$#]");

        if (parts.length >= 4) {
            // Si format complet : ref$qte$lot$sous_lot
            comptage.setReference(parts[0]);           // Juste la référence
            comptage.setQuantiteTotale(parseDouble(parts[1])); // Quantité
            comptage.setNumLot(parts[2]);              // Lot
            comptage.setNumSousLot(parts[3]);          // Sous-lot

            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.parseAndSetReferenceData - Parsed: " +
                    "ref=" + parts[0] + ", qte=" + parts[1] + ", lot=" + parts[2] + ", sous-lot=" + parts[3]);
        } else if (parts.length >= 1) {
            // Si seulement la référence
            comptage.setReference(parts[0]);
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.parseAndSetReferenceData - Simple reference: " + parts[0]);
        } else {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.parseAndSetReferenceData - ERROR: Invalid reference format: " + fullReference);
        }
    }

    /**
     * Méthode utilitaire pour parser double de manière sécurisée
     */
    private double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.parseDouble - WARNING: Cannot parse '" + value + "' as double, defaulting to 0");
            return 0.0;
        }
    }

    /**
     * Crée un nouveau comptage (opérateur renseigné en amont)
     */
    public Comptage ajouterComptage(Comptage comptage) {
        comptage.setTimestamp(LocalDateTime.now());

        // Parser la référence si elle contient le format complet
        if (comptage.getReference() != null) {
            String originalReference = comptage.getReference();
            parseAndSetReferenceData(comptage, originalReference);

            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.ajouterComptage - Processing reference: " +
                    "original=" + originalReference +
                    ", parsed_ref=" + comptage.getReference() +
                    ", lot=" + comptage.getNumLot() +
                    ", sous_lot=" + comptage.getNumSousLot() +
                    ", qte=" + comptage.getQuantiteTotale());
        }

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

                    // Parser la nouvelle référence si fournie
                    if (newData.getReference() != null) {
                        String originalReference = newData.getReference();
                        parseAndSetReferenceData(c, originalReference);
                    }

                    c.setTypeMatiere(newData.getTypeMatiere());
                    c.setPoids(newData.getPoids());
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

    public List<Comptage> getComptagesByOperateur(Long operateurId) {
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.getComptagesByOperateur - Operator ID: " + operateurId);

        List<Comptage> results = comptageRepository.findByOperateurId(operateurId);
        System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.getComptagesByOperateur - Found " + results.size() + " comptages");

        return results;
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
     * s
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
                        ", lot=" + c.getNumLot() +
                        ", sous_lot=" + c.getNumSousLot() +
                        ", qte=" + c.getQuantiteTotale() +
                        ", numComptage=" + c.getNumComptage() +
                        ", operateurId=" + c.getOperateurId() +
                        ", poids=" + c.getPoids());
            }
        } else {
            System.out.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] ComptageService.findAll - WARNING: No comptages found in database!");
        }

        return results;
    }
}