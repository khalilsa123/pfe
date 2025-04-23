export interface Comptage {
  id?: number;
   operateurId: any;
  emplacement: string;
  reference: string;
  numLot: string;
  numSousLot: string;
  typeMatiere: string;
  poids: number;
  quantiteTotale: number;
  numComptage: number;
  timestamp:       string;   // → utilisé pour la colonne « Date »
}
