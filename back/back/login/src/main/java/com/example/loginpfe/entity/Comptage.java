package com.example.loginpfe.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Comptage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identifiant de l'opérateur qui effectue le comptage
    private Long operateurId;

    // Saisie manuelle ou via QR code
    private String emplacement;

    // Référence du produit/matière ou via QR code
    private String reference;

    // Numéro de lot via QR code
    private String numLot;

    // Numéro de sous-lot via QR code
    private String numSousLot;

    // Type de matière (pour l'instant, à modifier ultérieurement)
    private String typeMatiere;

    // Mesure de la quantité (en grammes) saisie par l'opérateur
    private double poids;

    // Quantité totale lue automatiquement via QR code
    private double quantiteTotale;

    // Numéro du comptage (1, 2 ou 3)
    private int numComptage;

    // Date et heure d'enregistrement
    private LocalDateTime timestamp;

    public Comptage() {
        this.timestamp = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOperateurId() { return operateurId; }
    public void setOperateurId(Long operateurId) { this.operateurId = operateurId; }

    public String getEmplacement() { return emplacement; }
    public void setEmplacement(String emplacement) { this.emplacement = emplacement; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getNumLot() { return numLot; }
    public void setNumLot(String numLot) { this.numLot = numLot; }

    public String getNumSousLot() { return numSousLot; }
    public void setNumSousLot(String numSousLot) { this.numSousLot = numSousLot; }

    public String getTypeMatiere() { return typeMatiere; }
    public void setTypeMatiere(String typeMatiere) { this.typeMatiere = typeMatiere; }

    public double getPoids() { return poids; }
    public void setPoids(double poids) { this.poids = poids; }

    public double getQuantiteTotale() { return quantiteTotale; }
    public void setQuantiteTotale(double quantiteTotale) { this.quantiteTotale = quantiteTotale; }

    public int getNumComptage() { return numComptage; }
    public void setNumComptage(int numComptage) { this.numComptage = numComptage; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
