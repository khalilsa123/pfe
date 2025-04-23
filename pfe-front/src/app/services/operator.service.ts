import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comptage }  from '../models/comptage.model';

@Injectable({ providedIn: 'root' })
export class OperatorService {
  private baseUrl = 'http://localhost:8080/api/operateurs';

  constructor(private http: HttpClient) { }

  getComptages(opId: number): Observable<Comptage[]> {
    return this.http.get<Comptage[]>(
      `${this.baseUrl}/${opId}/comptage`
    );
  }

  addComptage(opId: number, c: Comptage): Observable<Comptage> {
    return this.http.post<Comptage>(
      `${this.baseUrl}/${opId}/comptage`,
      c
    );
  }

  editComptage(opId: number, c: Comptage): Observable<Comptage> {
    return this.http.put<Comptage>(
      `${this.baseUrl}/${opId}/comptage/${c.id}`,
      c
    );
  }

  deleteComptage(opId: number, cId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${opId}/comptage/${cId}`
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