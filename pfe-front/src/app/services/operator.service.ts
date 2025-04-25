// src/app/services/operator.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

const BASE_API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class OperatorService {
  constructor(private http: HttpClient) {}

  /** Exemple : lister tous les opérateurs (à adapter si vous avez ce endpoint) */
  getAllOperateurs(): Observable<User[]> {
    return this.http.get<User[]>(`${BASE_API}/operateurs`);
  }

  // … ici uniquement les méthodes liées aux opérateurs
}
