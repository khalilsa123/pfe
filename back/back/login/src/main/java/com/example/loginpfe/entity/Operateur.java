/**package com.example.loginpfe.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Operateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    @Column(unique = true)
    private String matricule;

    // Indique si l'opérateur est actif (pour suppression logique)
    private boolean actif = true;

    // Champ pour le nombre de comptages effectués
    // La valeur par défaut est 0 et la colonne est non nullable.
    @Column(nullable = false, columnDefinition = "int default 0")
    private int nombreComptagesEffectues = 0;

    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }

    public int getNombreComptagesEffectues() {
        return nombreComptagesEffectues;
    }

    public void setNombreComptagesEffectues(int nombreComptagesEffectues) {
        this.nombreComptagesEffectues = nombreComptagesEffectues;
    }

    // Méthode pour incrémenter le compteur de comptages
    public void incrementerComptage() {
        this.nombreComptagesEffectues++;
    }
}*/
