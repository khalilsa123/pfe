// src/app/services/comptage.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comptage } from '../models/comptage.model';

const BASE_API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ComptageService {
  constructor(private http: HttpClient) {}

  /** Récupérer tous les comptages (SUPERVISEUR/ADMIN) */
  getAllComptages(): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(`${BASE_API}/comptages`);
  }

  /** Récupérer les comptages d’un opérateur donné */
  getComptagesByOperateur(operateurId: number): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(
      `${BASE_API}/operateurs/${operateurId}/comptage`
    );
  }

  /** Créer un nouveau comptage pour cet opérateur */
  addComptage(
    operateurId: number,
    payload: Comptage
  ): Observable<Comptage> {
    return this.http.post<Comptage>(
      `${BASE_API}/operateurs/${operateurId}/comptage`,
      payload
    );
  }

  /** Mettre à jour un comptage existant */
  updateComptage(
    operateurId: number,
    comptage: Comptage
  ): Observable<Comptage> {
    if (!comptage.id) {
      throw new Error('ID de comptage manquant pour la mise à jour');
    }
    return this.http.put<Comptage>(
      `${BASE_API}/operateurs/${operateurId}/comptage/${comptage.id}`,
      comptage
    );
  }

  /** Supprimer un comptage */
  deleteComptage(
    operateurId: number,
    comptageId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${BASE_API}/operateurs/${operateurId}/comptage/${comptageId}`
    );
  }
}
