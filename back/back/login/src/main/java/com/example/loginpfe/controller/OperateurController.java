/**
package com.example.loginpfe.controller;

import com.example.loginpfe.dto.OperateurDTO;
import com.example.loginpfe.entity.Operateur;
import com.example.loginpfe.Service.OperateurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operateurs")
@CrossOrigin(origins = "http://localhost:4200")
public class OperateurController {

    private final OperateurService operateurService;

    public OperateurController(OperateurService operateurService) {
        this.operateurService = operateurService;
    }


    @PostMapping
    public ResponseEntity<OperateurDTO> creerOperateur(@RequestBody OperateurDTO dto) {
        Operateur o = new Operateur();
        o.setNom(dto.getNom());
        o.setPrenom(dto.getPrenom());
        o.setMatricule(dto.getMatricule());
        Operateur saved = operateurService.creerOperateur(o);
        OperateurDTO out = new OperateurDTO(
                saved.getId(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getMatricule()
        );
        return new ResponseEntity<>(out, HttpStatus.CREATED);
    }


    @GetMapping("/{id}")
    public ResponseEntity<OperateurDTO> getOperateur(@PathVariable Long id) {
        Operateur o = operateurService.getOperateurById(id);
        OperateurDTO dto = new OperateurDTO(o.getId(), o.getNom(), o.getPrenom(), o.getMatricule());
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<OperateurDTO>> listerOperateurs() {
        List<OperateurDTO> dtos = operateurService
                .listerOperateursActifs()
                .stream()
                .map(o -> new OperateurDTO(o.getId(), o.getNom(), o.getPrenom(), o.getMatricule()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // NOTE : tous les endpoints “/comptage” ont été déplacés dans ComptageController
}*/
/**package com.example.loginpfe.controller;

import com.example.loginpfe.dto.OperateurDTO;
import com.example.loginpfe.entity.Operateur;
import com.example.loginpfe.Service.OperateurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/operateurs")
@CrossOrigin(origins = "http://localhost:4200")

public class OperateurController {

    private final OperateurService operateurService;

    public OperateurController(OperateurService operateurService) {
        this.operateurService = operateurService;
    }

    // --- Gestion des opérateurs ---

    // Créer un opérateur (accessible par SUPERVISEUR/ADMIN)
    @PostMapping
    public ResponseEntity<OperateurDTO> creerOperateur(@RequestBody OperateurDTO operateurDTO) {
        Operateur operateur = new Operateur();
        operateur.setNom(operateurDTO.getNom());
        operateur.setPrenom(operateurDTO.getPrenom());
        operateur.setMatricule(operateurDTO.getMatricule());
        Operateur created = operateurService.creerOperateur(operateur);
        OperateurDTO responseDTO = new OperateurDTO(created.getId(), created.getNom(), created.getPrenom(), created.getMatricule());
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // Obtenir les informations d'un opérateur par son ID
    @GetMapping("/{id}")
    public ResponseEntity<OperateurDTO> getOperateur(@PathVariable Long id) {
        Operateur operateur = operateurService.getOperateurById(id);
        OperateurDTO dto = new OperateurDTO(operateur.getId(), operateur.getNom(), operateur.getPrenom(), operateur.getMatricule());
        return ResponseEntity.ok(dto);
    }

    // Lister tous les opérateurs actifs
    @GetMapping
    public ResponseEntity<List<OperateurDTO>> listerOperateurs() {
        List<Operateur> operateurs = operateurService.listerOperateursActifs();
        List<OperateurDTO> dtos = operateurs.stream()
                .map(o -> new OperateurDTO(o.getId(), o.getNom(), o.getPrenom(), o.getMatricule()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // --- Gestion du comptage ---

    // Ajouter un comptage : incrémente le compteur pour chaque opérateur dont l'ID est fourni.
    @PostMapping("/comptage")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void enregistrerComptage(@RequestBody List<Long> operateursIds) {
        operateurService.enregistrerComptage(operateursIds);
    }

    // Modifier manuellement le comptage d'un opérateur en définissant une nouvelle valeur.
    @PutMapping("/{id}/comptage")
    public ResponseEntity<Operateur> modifierComptage(
            @PathVariable Long id,
            @RequestParam int nouvelleValeur) {
        return ResponseEntity.ok(operateurService.modifierComptage(id, nouvelleValeur));
    }

    // Réinitialiser (mettre à zéro) le comptage pour un opérateur.
    @PutMapping("/{id}/reset-comptage")
    public ResponseEntity<Operateur> resetComptage(@PathVariable Long id) {
        return ResponseEntity.ok(operateurService.resetComptage(id));
    }

    // Afficher le nombre actuel de comptages pour un opérateur.
    @GetMapping("/{id}/comptage")
    public ResponseEntity<Integer> afficherComptage(@PathVariable Long id) {
        return ResponseEntity.ok(operateurService.getNombreComptages(id));
    }
}
*/