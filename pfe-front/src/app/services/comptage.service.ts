// src/app/services/comptage.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Comptage } from '../models/comptage.model';

// URL de base pour toutes les requêtes API
const API_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class ComptageService {
  constructor(private http: HttpClient) {}

  // Crée les headers + éventuels params pour le Bearer token
  private getAuthOptions(params?: HttpParams): {
    headers: HttpHeaders,
    params?: HttpParams
  } {
    let token = localStorage.getItem('jwt');
    if (token?.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return params ? { headers, params } : { headers };
  }

  /** Récupérer tous les comptages (SUPERVISEUR/ADMIN) */
  getAllComptages(): Observable<Comptage[]> {
    console.log('ComptageService - Calling API to get all comptages');
    return this.http.get<Comptage[]>(
      `${API_URL}/api/comptages`,
      this.getAuthOptions()
    ).pipe(
      tap(response => console.log('ComptageService - API response:', response)),
      catchError(err => {
        console.error('ComptageService - Error fetching comptages:', err);
        return throwError(() => err);
      })
    );
  }

  /** Récupérer le nombre de comptages pour un opérateur */
  getComptageCountForOperateur(operateurId: number): Observable<number> {
    return this.getComptagesByOperateur(operateurId).pipe(
      map(list => list.length),
      catchError(() => of(0))
    );
  }

  /** Récupérer les comptages d'un opérateur donné */
   getComptagesByOperateur(operateurId: number): Observable<Comptage[]> {
        return this.http.get<Comptage[]>(
            `${API_URL}/api/comptages/by-operator/${operateurId}`,
            this.getAuthOptions()
        ).pipe(
            catchError(err => {
                console.error('Erreur récupération comptages par opérateur:', err);
                return throwError(() => err);
            })
        );
    }

  /** Test d'ajout d'un comptage simple */
  testAddComptage(operateurId: number): Observable<any> {
    const simpleComptage = {
      reference: "test$100$lot1$souslot1",
      poids: 100,
      numComptage: 1,
      typeMatiere: "Cousue"          // ← on inclut désormais le type
    };
    
    console.log('Test d\'envoi comptage:', JSON.stringify(simpleComptage));
    
    return this.http.post<any>(
      `${API_URL}/api/operateurs/${operateurId}/comptage`,
      simpleComptage,
      this.getAuthOptions()
    ).pipe(
      catchError(err => {
        console.error('Erreur test:', err);
        return throwError(() => err);
      })
    );
  }
  
  /** Créer un nouveau comptage pour cet opérateur */
  addComptage(operateurId: number, comptage: Comptage): Observable<Comptage> {
    const completeComptage: Comptage = {
      reference:       comptage.reference,
      numLot:          comptage.numLot       || '',
      numSousLot:      comptage.numSousLot   || '',
      poids:           comptage.poids,
      numComptage:     comptage.numComptage  || 1,
      quantiteTotale:  comptage.quantiteTotale || 0,
      operateurId:     operateurId,
      emplacement:     comptage.emplacement  || '',
      iteration:       1,
      timestamp:       new Date().toISOString(),
      typeMatiere:     comptage.typeMatiere  || ''   // ← ajouté
    };
    
    console.log('Envoi de comptage (complet):', JSON.stringify(completeComptage));
    
    return this.http.post<Comptage>(
      `${API_URL}/api/operateurs/${operateurId}/comptage`,
      completeComptage,
      this.getAuthOptions()
    ).pipe(
      catchError(err => {
        console.error('Erreur détaillée lors de l\'ajout du comptage:', err);
        return throwError(() => err);
      })
    );
  }

  /** Mettre à jour un comptage existant */
  updateComptage(id: number, comptage: Comptage): Observable<Comptage> {
    // Garder l'itération et le type de matière
    comptage.iteration    = comptage.iteration || 1;
    comptage.typeMatiere  = comptage.typeMatiere || '';

    console.log('Mise à jour comptage:', JSON.stringify(comptage));
    
    return this.http.put<Comptage>(
      `${API_URL}/api/operateurs/${comptage.operateurId}/comptage/${id}`,
      comptage,
      this.getAuthOptions()
    ).pipe(
      catchError(err => {
        console.error('Erreur lors de la mise à jour du comptage:', err);
        return throwError(() => err);
      })
    );
  }

  /** Supprimer un comptage */
  deleteComptage(operateurId: number, comptageId: number): Observable<any> {
    console.log('Suppression comptage:', comptageId);
    
    return this.http.delete<any>(
      `${API_URL}/api/operateurs/${operateurId}/comptage/${comptageId}`,
      this.getAuthOptions()
    ).pipe(
      catchError(err => {
        console.error('Erreur lors de la suppression du comptage:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtenir le nombre d'itérations pour une référence et un type de comptage */
  getIterationCount(reference: string, numComptage: number): Observable<number> {
    const params = new HttpParams()
      .set('reference', reference)
      .set('numComptage', numComptage.toString());
    
    console.log('Récupération itération:', reference, numComptage);
    
    return this.http.get<number>(
      `${API_URL}/api/comptages/iteration-count`, 
      { ...this.getAuthOptions(params), observe: 'body' }
    ).pipe(
      catchError(err => {
        console.warn('API iteration-count inaccessible, valeur par défaut utilisée', err);
        return of(0);
      })
    );
  }
}
