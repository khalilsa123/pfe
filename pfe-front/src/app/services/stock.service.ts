import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../../app/models/stock.model';
//import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8080/api/stocks';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les stocks
   */
  getAll(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  /**
   * Récupère un stock par sa référence
   */
  getByReference(reference: string): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${reference}`);
  }
}