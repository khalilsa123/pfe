// src/app/services/authentificationn.service.ts
import { Injectable }               from '@angular/core';
import { HttpClient, HttpHeaders }  from '@angular/common/http';
import { Observable, throwError }   from 'rxjs';
import { catchError, map }          from 'rxjs/operators';
import { login, AuthResponse, User }from '../models/user.model';

const AUTH_API = 'http://localhost:8080/auth';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthentificationnServiceService {

  constructor(private http: HttpClient) { }

  /**
   * Login: POST http://localhost:8080/api/auth/login
   * Stocke le JWT et l’utilisateur courant dans localStorage
   */
  userLogin(credentials: login): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${AUTH_API}/login`, credentials, httpOptions)
      .pipe(
        map(response => {
          if (response && response.access_token) {
            localStorage.setItem('jwt', response.access_token);
            // on stocke aussi l’objet user complet
            localStorage.setItem('currentUser', JSON.stringify(response.user as User));
          }
          return response;
        }),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Register: POST http://localhost:8080/api/auth/register
   */
  register(user: User): Observable<string> {
    return this.http
      .post(`${AUTH_API}/register`, JSON.stringify(user), {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }),
        responseType: 'text'
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  /**
   * Update password: PUT http://localhost:8080/api/auth/updatepassword/{id}
   */
  updatePassword(id: number, user: User): Observable<any> {
    return this.http
      .put<any>(`${AUTH_API}/updatepassword/${id}`, user, httpOptions)
      .pipe(catchError(err => throwError(() => err)));
  }

  /**
   * Récupère l’utilisateur courant depuis le localStorage
   */
  getCurrentUser(): User | null {
    const json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) as User : null;
  }

  /**
   * Déconnexion: supprime tout du localStorage
   */
  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = `Erreur cliente : ${error.error.message}`;
    } else {
      message = `Erreur ${error.status} : ${error.message}`;
    }
    console.error(message);
    return throwError(() => new Error(message));
  }
}
