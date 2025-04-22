// src/app/models/comptage.model.ts
export interface Comptage {
    id?: number;
    operateurId: number;
    emplacement: string;
    reference: string;
    numLot: string;
    numSousLot: string;
    typeMatiere: string;
    poids: number;
    quantiteTotale: number;
    numComptage: number;
    timestamp?: Date;
    token?: string;
  }
  