// src/main/java/com/example/loginpfe/entity/SessionInventaire.java
package com.example.loginpfe.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "session_inventaire")
public class SessionInventaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "assignment_completed", nullable = false)
    private Boolean assignmentCompleted = false;

    @Column(name = "nom_session", nullable = false)
    private String nomSession;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;

    @Column(name = "commentaire", columnDefinition = "TEXT")
    private String commentaire;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("timestamp ASC")
    private List<Comptage> comptages = new ArrayList<>();

    public SessionInventaire() {
    }

    public SessionInventaire(String nomSession,
                             LocalDate dateDebut,
                             LocalDate dateFin,
                             String commentaire) {
        this.nomSession = nomSession;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.commentaire = commentaire;
    }

    // — Getters & Setters —

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getAssignmentCompleted() {
        return assignmentCompleted;
    }

    public void setAssignmentCompleted(Boolean assignmentCompleted) {
        this.assignmentCompleted = assignmentCompleted;
    }

    public String getNomSession() {
        return nomSession;
    }

    public void setNomSession(String nomSession) {
        this.nomSession = nomSession;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public List<Comptage> getComptages() {
        return comptages;
    }

    public void setComptages(List<Comptage> comptages) {
        this.comptages = comptages;
    }
}
