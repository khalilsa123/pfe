// src/app/services/comptage.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Comptage } from '../models/comptage.model';

const COMPTAGE_API = 'http://localhost:8080/api/comptages';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class ComptageService {
  constructor(private http: HttpClient) {}

  /** Récupérer tous les comptages (SUPERVISEUR/ADMIN) */
  getAllComptages(): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(COMPTAGE_API)
      .pipe(catchError(err => throwError(() => err)));
  }

  /** Récupérer les comptages d’un opérateur donné */
  getComptagesByOperateur(operateurId: number): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(
      `${COMPTAGE_API}/operator/${operateurId}/comptage`
    );
  }

  /** Créer un nouveau comptage pour cet opérateur */
  addComptage(operateurId: number, comptage: Comptage): Observable<Comptage> {
    // First get the current iteration count
    return this.getIterationCount(comptage.reference, comptage.numComptage).pipe(
      switchMap(count => {
        // Set the iteration number
        comptage.iteration = count + 1;
        // Then proceed with the comptage creation
        return this.http.post<Comptage>(
          `${COMPTAGE_API}/operator/${operateurId}`,
          comptage,
          httpOptions
        ).pipe(catchError(err => throwError(() => err)));
      })
    );
  }

  /** Mettre à jour un comptage existant */
  updateComptage(id: number, comptage: Comptage): Observable<any> {
    // If changing the reference or numComptage, we need to update iteration
    return this.getIterationCount(comptage.reference, comptage.numComptage).pipe(
      map(count => {
        // Set the iteration number if not already set
        if (!comptage.iteration) {
          comptage.iteration = count + 1;
        }
        // Then proceed with the update
        return this.http.put(
          `${COMPTAGE_API}/${id}`,
          comptage,
          httpOptions
        ).pipe(catchError(err => throwError(() => err)));
      })
    );
  }

  /** Supprimer un comptage */
  deleteComptage(operateurId: number, comptageId: number): Observable<any> {
    return this.http.delete(
      `${COMPTAGE_API}/operator/${operateurId}/comptage/${comptageId}`,
      httpOptions
    ).pipe(catchError(err => throwError(() => err)));
  }

  /** Get iteration count for a specific reference and counting type */
  getIterationCount(reference: string, numComptage: number): Observable<number> {
    const params = new HttpParams()
      .set('reference', reference)
      .set('numComptage', numComptage.toString());
      
    return this.http.get<number>(`${COMPTAGE_API}/iteration-count`, { params })
      .pipe(catchError(err => throwError(() => err)));
  }
}