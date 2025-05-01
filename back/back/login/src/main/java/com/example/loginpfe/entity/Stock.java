package com.example.loginpfe.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "stock")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** match this to the “reference” you use in comptage */
    @Column(nullable = false, unique = true)
    private String reference;

    /** total quantity in stock */
    @Column(name = "quantite_totale", nullable = false)
    private Double quantiteTotale;

    /** optional: type of material */
    @Column(name = "type_matiere")
    private String typeMatiere;
    @Column(name = "lot ")
    private String lot;
    @Column(name = "sous_lot ")
    private String slot;

    public String getSlot() {
        return slot;
    }

    public void setSlot(String slot) {
        this.slot = slot;
    }

    public String getLot() {
        return lot;
    }

    public void setLot(String lot) {
        this.lot = lot;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public Double getQuantiteTotale() { return quantiteTotale; }
    public void setQuantiteTotale(Double quantiteTotale) { this.quantiteTotale = quantiteTotale; }

    public String getTypeMatiere() { return typeMatiere; }
    public void setTypeMatiere(String typeMatiere) { this.typeMatiere = typeMatiere; }
}