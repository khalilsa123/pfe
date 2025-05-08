// src/main/java/com/example/loginpfe/controller/SessionInventaireController.java
package com.example.loginpfe.controller;

import com.example.loginpfe.Service.SessionInventaireService;
import com.example.loginpfe.entity.SessionInventaire;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session-inventaire")
public class SessionInventaireController {

    private final SessionInventaireService service;

    public SessionInventaireController(SessionInventaireService service) {
        this.service = service;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SessionInventaire> create(@RequestBody SessionInventaire session) {
        return ResponseEntity.ok(service.create(session));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISEUR','OPERATEUR')")
    @GetMapping
    public ResponseEntity<List<SessionInventaire>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISEUR','OPERATEUR')")
    @GetMapping("/{id}")
    public ResponseEntity<SessionInventaire> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISEUR','OPERATEUR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISEUR','OPERATEUR')")
    @PostMapping("/{id}/populate")
    public ResponseEntity<SessionInventaire> populate(@PathVariable Long id) {
        return ResponseEntity.ok(service.populateSession(id));
    }
}
