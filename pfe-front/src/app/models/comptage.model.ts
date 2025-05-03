export interface Comptage {
  id?: number;
  reference: string;
  quantiteTotale: number;
  numLot: string;
  numSousLot: string;
  poids: number;
  numComptage: number;
  emplacement?: string;
  operateurId?: number;
  timestamp?: string;
  iteration?: number; // Track how many times this counting has been performed
}