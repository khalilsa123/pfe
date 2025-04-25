// src/main/java/com/example/loginpfe/controller/ComptageController.java
package com.example.loginpfe.controller;

import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.Service.ComptageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class ComptageController {

    private final ComptageService comptageService;

    public ComptageController(ComptageService comptageService) {
        this.comptageService = comptageService;
    }

    /** NOUVEAU : récupère tous les comptages de la base */
    @GetMapping("/comptages")
    public ResponseEntity<List<Comptage>> getAllComptages() {
        List<Comptage> all = comptageService.findAll();
        return ResponseEntity.ok(all);
    }

    /** Liste tous les comptages pour un opérateur donné */
    @GetMapping("/operateurs/{operateurId}/comptage")
    public ResponseEntity<List<Comptage>> listComptages(
            @PathVariable Long operateurId) {
        List<Comptage> list = comptageService.afficherComptagesParOperateur(operateurId);
        return ResponseEntity.ok(list);
    }

    /** Crée un nouveau comptage pour cet opérateur */
    @PostMapping("/operateurs/{operateurId}/comptage")
    public ResponseEntity<Comptage> createComptage(
            @PathVariable Long operateurId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage saved = comptageService.ajouterComptage(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /** Modifie un comptage existant */
    @PutMapping("/operateurs/{operateurId}/comptage/{comptageId}")
    public ResponseEntity<Comptage> updateComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage updated = comptageService.modifierComptage(comptageId, dto);
        return ResponseEntity.ok(updated);
    }

    /** Supprime un comptage */
    @DeleteMapping("/operateurs/{operateurId}/comptage/{comptageId}")
    public ResponseEntity<Void> deleteComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId) {
        comptageService.supprimerComptage(comptageId);
        return ResponseEntity.noContent().build();
    }
}
