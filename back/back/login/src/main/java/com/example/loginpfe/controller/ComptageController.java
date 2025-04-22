// src/main/java/com/example/loginpfe/controller/ComptageController.java
package com.example.loginpfe.controller;

import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.Service.ComptageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "localhost:4200")
@RestController
@RequestMapping("/api/operateurs/{operateurId}/comptage")
public class ComptageController {

    private final ComptageService comptageService;

    public ComptageController(ComptageService comptageService) {
        this.comptageService = comptageService;
    }

    /** Liste tous les comptages pour un opérateur donné */
    @GetMapping
    public ResponseEntity<List<Comptage>> listComptages(@PathVariable Long operateurId) {
        List<Comptage> all = comptageService.afficherComptagesParOperateur(operateurId);
        return ResponseEntity.ok(all);
    }

    /** Crée un nouveau comptage pour cet opérateur */
    @PostMapping
    public ResponseEntity<Comptage> createComptage(
            @PathVariable Long operateurId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage saved = comptageService.ajouterComptage(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /** Modifie un comptage existant */
    @PutMapping("/{comptageId}")
    public ResponseEntity<Comptage> updateComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage updated = comptageService.modifierComptage(comptageId, dto);
        return ResponseEntity.ok(updated);
    }

    /** Supprime un comptage */
    @DeleteMapping("/{comptageId}")
    public ResponseEntity<Void> deleteComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId) {
        comptageService.supprimerComptage(comptageId);
        return ResponseEntity.noContent().build();
    }
}
/**package com.example.loginpfe.controller;

import com.example.loginpfe.dto.ComptageDTO;
import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.Service.ComptageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comptages")
public class ComptageController {

    private final ComptageService comptageService;

    public ComptageController(ComptageService comptageService) {
        this.comptageService = comptageService;
        System.out.println("i'm here khail :!");
    }

    // Endpoint pour ajouter un nouveau comptage
    @PostMapping
    public ResponseEntity<ComptageDTO> ajouterComptage(@RequestBody ComptageDTO comptageDTO) {
        Comptage comptage = new Comptage();
        comptage.setOperateurId(comptageDTO.getOperateurId());
        comptage.setEmplacement(comptageDTO.getEmplacement());
        comptage.setReference(comptageDTO.getReference());
        comptage.setNumLot(comptageDTO.getNumLot());
        comptage.setNumSousLot(comptageDTO.getNumSousLot());
        comptage.setTypeMatiere(comptageDTO.getTypeMatiere());
        comptage.setPoids(comptageDTO.getPoids());
        comptage.setQuantiteTotale(comptageDTO.getQuantiteTotale());
        comptage.setNumComptage(comptageDTO.getNumComptage());

        Comptage created = comptageService.ajouterComptage(comptage);
        ComptageDTO responseDTO = new ComptageDTO(created.getId(), created.getOperateurId(), created.getEmplacement(),
                created.getReference(), created.getNumLot(), created.getNumSousLot(),
                created.getTypeMatiere(), created.getPoids(), created.getQuantiteTotale(),
                created.getNumComptage(), created.getTimestamp());
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // Endpoint pour modifier un comptage existant
    @PutMapping("/{id}")
    public ResponseEntity<ComptageDTO> modifierComptage(@PathVariable Long id, @RequestBody ComptageDTO comptageDTO) {
        Comptage comptage = new Comptage();
        comptage.setOperateurId(comptageDTO.getOperateurId());
        comptage.setEmplacement(comptageDTO.getEmplacement());
        comptage.setReference(comptageDTO.getReference());
        comptage.setNumLot(comptageDTO.getNumLot());
        comptage.setNumSousLot(comptageDTO.getNumSousLot());
        comptage.setTypeMatiere(comptageDTO.getTypeMatiere());
        comptage.setPoids(comptageDTO.getPoids());
        comptage.setQuantiteTotale(comptageDTO.getQuantiteTotale());
        comptage.setNumComptage(comptageDTO.getNumComptage());

        Comptage updated = comptageService.modifierComptage(id, comptage);
        ComptageDTO responseDTO = new ComptageDTO(updated.getId(), updated.getOperateurId(), updated.getEmplacement(),
                updated.getReference(), updated.getNumLot(), updated.getNumSousLot(),
                updated.getTypeMatiere(), updated.getPoids(), updated.getQuantiteTotale(),
                updated.getNumComptage(), updated.getTimestamp());
        return ResponseEntity.ok(responseDTO);
    }

    // Endpoint pour supprimer un comptage
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimerComptage(@PathVariable Long id) {
        comptageService.supprimerComptage(id);
    }

    // Endpoint pour afficher tous les comptages pour un opérateur donné
    @GetMapping("/operateur/{operateurId}")
    public ResponseEntity<List<ComptageDTO>> afficherComptages(@PathVariable Long operateurId) {
        List<Comptage> list = comptageService.afficherComptagesParOperateur(operateurId);
        List<ComptageDTO> dtos = list.stream()
                .map(c -> new ComptageDTO(c.getId(), c.getOperateurId(), c.getEmplacement(), c.getReference(),
                        c.getNumLot(), c.getNumSousLot(), c.getTypeMatiere(), c.getPoids(),
                        c.getQuantiteTotale(), c.getNumComptage(), c.getTimestamp()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}*/
