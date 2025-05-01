import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Comptage } from '../models/comptage.model';
import { ComptageService } from './comptage.service';
import { AuthentificationnServiceService } from './authentificationn.service';

// Interface pour représenter un résultat de comptage
export interface ComptageSummary {
  operatorId: number;
  operatorName: string;
  poids: number;
  date: Date;
}

export interface ComptageResult {
  reference: string;  // Format original ref$qte$lot$sous
  lot: string;
  sousLot: string;
  comptage1?: ComptageSummary;
  comptage2?: ComptageSummary;
  comptage3?: ComptageSummary;
  status: 'valid' | 'invalid' | 'needsThird' | 'validWithThird' | 'incomplete';
  difference?: number;  // Différence en pourcentage entre comptage1 et comptage2
  poidsFinal?: number;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  // URL de l'API - remplacez par votre URL réelle
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private comptageService: ComptageService,
    private authService: AuthentificationnServiceService
  ) {}

  /**
   * Récupère et traite tous les résultats de comptage
   */
  getComptageResults(): Observable<ComptageResult[]> {
    // Récupérer tous les comptages et les opérateurs
    return forkJoin({
      comptages: this.comptageService.getAllComptages(),
      operators: this.authService.getUsersByRole('OPERATEUR')
    }).pipe(
      map(result => {
        const { comptages, operators } = result;
        
        // Créer une map pour un accès rapide aux opérateurs par ID
        const operatorsMap = new Map();
        operators.forEach(op => {
          if (op.id) {
            operatorsMap.set(op.id, op);
          }
        });
        
        // Grouper les comptages par référence (ref$lot$sous)
        const comptageGroups = new Map<string, Comptage[]>();
        
        comptages.forEach(comptage => {
          // Format de référence attendu: ref$qte$lot$sous
          const parts = comptage.reference.split('$');
          if (parts.length < 4) return;
          
          // Créer une clé composite ref$lot$sous pour le groupement
          const ref = parts[0];
          const lot = parts[2];
          const sousLot = parts[3];
          const groupKey = `${ref}$${lot}$${sousLot}`;
          
          if (!comptageGroups.has(groupKey)) {
            comptageGroups.set(groupKey, []);
          }
          
          comptageGroups.get(groupKey)!.push(comptage);
        });
        
        // Créer les résultats de comptage
        const results: ComptageResult[] = [];
        
        comptageGroups.forEach((groupComptages, groupKey) => {
          // Trier par numComptage pour faciliter le traitement
          groupComptages.sort((a, b) => a.numComptage - b.numComptage);
          
          // Extraire les informations de référence
          const reference = groupComptages[0].reference;
          const parts = reference.split('$');
          const ref = parts[0];
          const lot = parts[2] || '';
          const sousLot = parts[3] || '';
          
          // Préparer les données de chaque comptage
          const comptage1 = groupComptages.find(c => c.numComptage === 1);
          const comptage2 = groupComptages.find(c => c.numComptage === 2);
          const comptage3 = groupComptages.find(c => c.numComptage === 3);
          
          let comp1Summary: ComptageSummary | undefined;
          let comp2Summary: ComptageSummary | undefined;
          let comp3Summary: ComptageSummary | undefined;
          
          // Trouver les informations d'opérateur pour chaque comptage
          if (comptage1) {
            const operator = operatorsMap.get(comptage1.operateurId);
            comp1Summary = {
              operatorId: comptage1.operateurId!,
              operatorName: operator 
                ? `${operator.firstname} ${operator.lastname}` 
                : `Opérateur #${comptage1.operateurId}`,
              poids: comptage1.poids,
              date: new Date(comptage1.timestamp!)
            };
          }
          
          if (comptage2) {
            const operator = operatorsMap.get(comptage2.operateurId);
            comp2Summary = {
              operatorId: comptage2.operateurId!,
              operatorName: operator 
                ? `${operator.firstname} ${operator.lastname}` 
                : `Opérateur #${comptage2.operateurId}`,
              poids: comptage2.poids,
              date: new Date(comptage2.timestamp!)
            };
          }
          
          if (comptage3) {
            const operator = operatorsMap.get(comptage3.operateurId);
            comp3Summary = {
              operatorId: comptage3.operateurId!,
              operatorName: operator 
                ? `${operator.firstname} ${operator.lastname}` 
                : `Opérateur #${comptage3.operateurId}`,
              poids: comptage3.poids,
              date: new Date(comptage3.timestamp!)
            };
          }
          
          // Calculer le statut et la différence
          let status: 'valid' | 'invalid' | 'needsThird' | 'validWithThird' | 'incomplete' = 'incomplete';
          let difference: number | undefined;
          let poidsFinal: number | undefined;
          
          // Si les deux premiers comptages existent
          if (comp1Summary && comp2Summary) {
            const poids1 = comp1Summary.poids;
            const poids2 = comp2Summary.poids;
            const maxPoids = Math.max(poids1, poids2);
            
            // Calcul de la différence en pourcentage
            difference = maxPoids === 0 ? 0 : Math.abs(poids1 - poids2) / maxPoids * 100;
            
            if (difference < 5) {
              // Moins de 5% de différence => valide
              status = 'valid';
              poidsFinal = Math.min(poids1, poids2);
            } else {
              // Plus de 5% de différence
              if (comp3Summary) {
                // Si 3ème comptage existe => valide avec le 3ème
                status = 'validWithThird';
                poidsFinal = comp3Summary.poids;
              } else {
                // Sinon => besoin d'un 3ème comptage
                status = 'needsThird';
              }
            }
          } else {
            // Comptage incomplet (manque comptage1 ou comptage2)
            status = 'incomplete';
          }
          
          // Trouver la date de dernière mise à jour
          const dates = [
            comp1Summary?.date, 
            comp2Summary?.date, 
            comp3Summary?.date
          ].filter(d => d !== undefined) as Date[];
          
          const lastUpdate = dates.length > 0 
            ? new Date(Math.max(...dates.map(d => d.getTime())))
            : new Date();
          
          // Créer l'objet résultat
          const result: ComptageResult = {
            reference,
            lot,
            sousLot,
            comptage1: comp1Summary,
            comptage2: comp2Summary,
            comptage3: comp3Summary,
            status,
            difference,
            poidsFinal,
            lastUpdate
          };
          
          results.push(result);
        });
        
        // Trier par date de mise à jour (du plus récent au plus ancien)
        return results.sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime());
      }),
      catchError(error => {
        console.error('Erreur lors de la récupération des résultats', error);
        return of([]);
      })
    );
  }

  /**
   * Valide un résultat final de comptage
   */
  validateFinalCount(resultId: string): Observable<any> {
    // Simulation - dans une implémentation réelle, appelez une API
    return of({ success: true });
  }
}