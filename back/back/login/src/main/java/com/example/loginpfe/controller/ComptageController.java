package com.example.loginpfe.controller;

import com.example.loginpfe.Service.ComptageService;
import com.example.loginpfe.Service.UserService;
import com.example.loginpfe.entity.Comptage;
import com.example.loginpfe.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final UserService userService;

    public ComptageController(ComptageService comptageService, UserService userService) {
        this.comptageService = comptageService;
        this.userService = userService;
    }

    @GetMapping("/comptages")
    public ResponseEntity<List<Comptage>> getAllComptages() {
        List<Comptage> all = comptageService.findAll();
        System.out.println("ComptageController - getAllComptages count: " + all.size());

        // Log a few examples if available
        if (!all.isEmpty()) {
            System.out.println("ComptageController - First comptage sample: " + all.get(0).getReference());
        } else {
            System.out.println("ComptageController - WARNING: No comptages found in database!");
        }

        return ResponseEntity.ok(all);
    }

    @PutMapping({"/operateurs/{id}/comptage-type", "/users/{id}/comptage-type"})
    @PreAuthorize("hasAnyRole('SUPERVISEUR','ADMIN')")
    public ResponseEntity<User> updateDefaultComptageType(
            @PathVariable("id") Long userId,
            @RequestBody Map<String, Integer> body) {

        int defaultType = body.get("defaultComptageType");
        User updated = userService.setDefaultComptageType(userId, defaultType);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/comptages/debug")
    public ResponseEntity<Map<String, Object>> debugComptages() {
        List<Comptage> all = comptageService.findAll();
        Map<String, Object> debug = new HashMap<>();
        debug.put("count", all.size());
        if (!all.isEmpty()) {
            debug.put("sample", all.get(0));
            Map<Integer, Integer> countByType = new HashMap<>();
            all.forEach(c -> countByType.merge(c.getNumComptage(), 1, Integer::sum));
            debug.put("countByType", countByType);
        } else {
            debug.put("message", "No comptages found");
        }
        return ResponseEntity.ok(debug);
    }

    @GetMapping("/comptages/iteration-count")
    public ResponseEntity<Integer> getIterationCount(
            @RequestParam String reference,
            @RequestParam int numComptage) {
        List<Comptage> comptages = comptageService.findAll();
        int count = (int) comptages.stream()
                .filter(c -> c.getReference().equals(reference)
                        && c.getNumComptage() == numComptage)
                .count();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/operateurs/{operateurId}/comptage")
    public ResponseEntity<List<Comptage>> listComptages(
            @PathVariable Long operateurId) {
        List<Comptage> list = comptageService.afficherComptagesParOperateur(operateurId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/operateurs/{operateurId}/comptage")
    public ResponseEntity<Comptage> createComptage(
            @PathVariable Long operateurId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage saved = comptageService.ajouterComptage(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/operateurs/{operateurId}/comptage/{comptageId}")
    public ResponseEntity<Comptage> updateComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId,
            @RequestBody Comptage dto) {
        dto.setOperateurId(operateurId);
        Comptage updated = comptageService.modifierComptage(comptageId, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/operateurs/{operateurId}/comptage/{comptageId}/affecter")
    @PreAuthorize("hasAnyRole('SUPERVISEUR','ADMIN')")
    public ResponseEntity<Comptage> affecterComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId) {
        Comptage updated = comptageService.affecterComptage(comptageId, operateurId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/operateurs/{operateurId}/comptage/{comptageId}")
    public ResponseEntity<Void> deleteComptage(
            @PathVariable Long operateurId,
            @PathVariable Long comptageId) {
        comptageService.supprimerComptage(comptageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/comptages/by-operator/{operateurId}")
    public ResponseEntity<List<Comptage>> getComptagesByOperator(
            @PathVariable Long operateurId) {

        System.out.println("ComptageController - getComptagesByOperator ID: " + operateurId);
        List<Comptage> comptages = comptageService.getComptagesByOperateur(operateurId);

        return ResponseEntity.ok(comptages);
    }

    @GetMapping("/comptages/between")
    public ResponseEntity<List<Comptage>> testBetween(
            @RequestParam String start,
            @RequestParam String end) {
        LocalDateTime s = LocalDateTime.parse(start);
        LocalDateTime e = LocalDateTime.parse(end);
        List<Comptage> result = comptageService.findUnassignedBetween(s, e);
        return ResponseEntity.ok(result);
    }
}
