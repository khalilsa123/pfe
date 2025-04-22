import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comptage } from '../models/comptage.model';

@Injectable({ providedIn: 'root' })
export class OperatorService {
  // Si tu mets en place un proxy, tu peux juste laisser '/api/operateurs'
  private baseUrl = 'http://localhost:8080/api/operateurs';

  constructor(private http: HttpClient) { }

  getComptages(operateurId: number): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(`${this.baseUrl}/${operateurId}/comptage`);
  }

  addComptage(comptage: Comptage): Observable<Comptage> {
    return this.http.post<Comptage>(
      `${this.baseUrl}/${comptage.operateurId}/comptage`,
      comptage
    );
  }

  editComptage(operateurId: number, comptage: Comptage): Observable<Comptage> {
    return this.http.put<Comptage>(
      `${this.baseUrl}/${operateurId}/comptage/${comptage.id}`,
      comptage
    );
  }

  deleteComptage(operateurId: number, comptageId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${operateurId}/comptage/${comptageId}`
    );
  }
}



/**import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comptage } from '../models/comptage.model';
import { Operateur } from '../models/operateur.model';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private baseUrl = 'http://localhost:8080/api/operateurs';

  constructor(private http: HttpClient) {}

  
  private getHeaders(json: boolean = false): { headers: HttpHeaders } {
    const token = localStorage.getItem('jwt');  // ou 'token' selon votre clé
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token ?? ''}`
    });
    if (json) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return { headers };
  }

 
  getComptages(operateurId: number): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(
      `${this.baseUrl}/${operateurId}/comptage`,
      this.getHeaders()
    );
  }

  addComptage(comptage: Comptage): Observable<Comptage> {
    return this.http.post<Comptage>(
      `${this.baseUrl}/comptage`,
      comptage,
      this.getHeaders(true)
    );
  }

  
  editComptage(id: number, comptage: Comptage): Observable<Comptage> {
    return this.http.put<Comptage>(
      `${this.baseUrl}/${id}/comptage`,
      comptage,
      this.getHeaders(true)
    );
  }

  
  resetComptage(id: number): Observable<Operateur> {
    return this.http.put<Operateur>(
      `${this.baseUrl}/${id}/reset-comptage`,
      null,
      this.getHeaders()
    );
  }

  // … ajoutez ici d'autres méthodes si besoin (deleteComptage, etc.)
}
*/