package com.example.loginpfe.dto;

import java.time.LocalDateTime;

public class ComptageDTO {
    private Long id;
    private Long operateurId;
    private String emplacement;
    private String reference;
    private String numLot;
    private String numSousLot;
    private String typeMatiere;
    private double poids;
    private double quantiteTotale;
    private int numComptage;
    private LocalDateTime timestamp;


    public ComptageDTO() {}

    public ComptageDTO(Long id, Long operateurId, String emplacement, String reference, String numLot,
                       String numSousLot, String typeMatiere, double poids, double quantiteTotale, int numComptage,
                       LocalDateTime timestamp) {
        this.id = id;
        this.operateurId = operateurId;
        this.emplacement = emplacement;
        this.reference = reference;
        this.numLot = numLot;
        this.numSousLot = numSousLot;
        this.typeMatiere = typeMatiere;
        this.poids = poids;
        this.quantiteTotale = quantiteTotale;
        this.numComptage = numComptage;
        this.timestamp = timestamp;
    }

    // Getters et setters
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