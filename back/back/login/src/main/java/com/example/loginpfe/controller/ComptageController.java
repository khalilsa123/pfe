package com.example.loginpfe.controller;

import com.example.loginpfe.Service.ComptageService;
import com.example.loginpfe.entity.Comptage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class ComptageController {

    private final ComptageService comptageService;

    public ComptageController(ComptageService comptageService) {
        this.comptageService = comptageService;
    }

    /**
     * NOUVEAU : récupère tous les comptages de la base
     */
    @GetMapping("/comptages")
    public ResponseEntity<List<Comptage>> getAllComptages() {
        System.out.println("ComptageController: getAllComptages() called");
        List<Comptage> all = comptageService.findAll();
        System.out.println("ComptageController: returning " + all.size() + " comptages");
        return ResponseEntity.ok(all);
    }

    /**
     * DEBUG: Endpoint for troubleshooting
     */
    @GetMapping("/comptages/debug")
    public ResponseEntity<Map<String, Object>> debugComptages() {
        System.out.println("Debug endpoint called");
        List<Comptage> all = comptageService.findAll();

        Map<String, Object> debug = new HashMap<>();
        debug.put("count", all.size());

        if (!all.isEmpty()) {
            // Include first item for inspection
            debug.put("sample", all.get(0));

            // Count by numComptage
            Map<Integer, Integer> countByType = new HashMap<>();
            for (Comptage c : all) {
                int type = c.getNumComptage();
                countByType.put(type, countByType.getOrDefault(type, 0) + 1);
            }
            debug.put("countByType", countByType);
        } else {
            debug.put("message", "No comptages found in database");
        }

        return ResponseEntity.ok(debug);
    }

    @GetMapping("/comptages/iteration-count")
    public ResponseEntity<Integer> getIterationCount(
            @RequestParam String reference,
            @RequestParam int numComptage) {
        // Comptez combien de comptages existent avec cette référence et ce numComptage
        List<Comptage> comptages = comptageService.findAll();
        long count = comptages.stream()
                .filter(c -> c.getReference().equals(reference) && c.getNumComptage() == numComptage)
                .count();
        return ResponseEntity.ok((int) count);
    }

    /**
     * Liste tous les comptages pour un opérateur donné
     */
    @GetMapping("/operateurs/{operateurId}/comptage")
    public ResponseEntity<List<Comptage>> listComptages(
            @PathVariable Long operateurId) {
        System.out.println("ComptageController: listComptages() for operateur " + operateurId);
        List<Comptage> list = comptageService.afficherComptagesParOperateur(operateurId);
        System.out.println("Found " + list.size() + " comptages for operateur " + operateurId);
        return ResponseEntity.ok(list);
    }

    /**
     * Crée un nouveau comptage pour cet opérateur
     */
    @PostMapping("/operateurs/{operateurId}/comptage")
    public ResponseEntity<Comptage> createComptage(
            @PathVariable Long operateurId,
            @RequestBody Comptage dto) {
        System.out.println("Creating comptage for operateur " + operateurId);
        System.out.println("Comptage data: " + dto.getReference() + ", numComptage=" + dto.getNumComptage());

        dto.setOperateurId(operateurId);
        Comptage saved = comptageService.ajouterComptage(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Modifie un comptage existant
     */
    @PutMapping("/operateurs/{operateurId}/comptage/{comptageId}")
    public ResponseEntity<Comptage> updateComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage updated = comptageService.modifierComptage(comptageId, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Supprime un comptage
     */
    @DeleteMapping("/operateurs/{operateurId}/comptage/{comptageId}")
    public ResponseEntity<Void> deleteComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId) {
        comptageService.supprimerComptage(comptageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/comptages/between")
    public ResponseEntity<List<Comptage>> testBetween(
            @RequestParam String start,
            @RequestParam String end
    ) {
        LocalDateTime s = LocalDateTime.parse(start);
        LocalDateTime e = LocalDateTime.parse(end);

        List<Comptage> result = comptageService.findUnassignedBetween(s, e);
        return ResponseEntity.ok(result);
    }
}