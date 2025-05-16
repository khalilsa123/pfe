// src/app/services/authentificationn.service.ts

import { Injectable }             from '@angular/core';
import { HttpClient }             from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map }        from 'rxjs/operators';
import { login, AuthResponse, User } from '../models/user.model';

const API_URL  = 'http://localhost:8080';
const AUTH_API = `${API_URL}/auth`;       // login & register
const USER_API = `${API_URL}/api/users`;  // CRUD utilisateurs

@Injectable({ providedIn: 'root' })
export class AuthentificationnServiceService {
  constructor(private http: HttpClient) {}

  userLogin(credentials: login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${AUTH_API}/login`,
      credentials
    ).pipe(
      map(res => {
        if (res.access_token) {
          localStorage.setItem('jwt', res.access_token);
          localStorage.setItem('currentUser', JSON.stringify(res.user as User));
        }
        return res;
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(user: User): Observable<string> {
    return this.http.post(
      `${AUTH_API}/register`,
      user,
      { responseType: 'text' }
    ).pipe(catchError(err => throwError(() => err)));
  }

  updatePassword(id: number, payload: { password: string }): Observable<any> {
    return this.http.put<any>(
      `${AUTH_API}/updatepassword/${id}`,
      payload
    ).pipe(catchError(err => throwError(() => err)));
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${AUTH_API}/users?role=${role}`)
      .pipe(catchError(err => throwError(() => err)));
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${AUTH_API}/users/${id}`)
      .pipe(catchError(err => throwError(() => err)));
  }

  getCurrentUser(): User | null {
    const json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) as User : null;
  }

  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentUser');
  }

  /**
   * ⚠️ Ici on passe vers /api/users, et l'intercepteur
   *    ajoutera automatiquement le header Authorization.
   */
  updateUserDefaultComptageType(userId: number, comptageType: number): Observable<any> {
    return this.http.put<any>(
      `${USER_API}/${userId}/comptage-type`,
      { defaultComptageType: comptageType }
    ).pipe(catchError(err => throwError(() => err)));
  }
}

/**import { Injectable }               from '@angular/core';
import { HttpClient, HttpHeaders }  from '@angular/common/http';
import { Observable, throwError }   from 'rxjs';
import { catchError, map }          from 'rxjs/operators';
import { login, AuthResponse, User } from '../models/user.model';

const AUTH_API = 'http://localhost:8080/auth';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({ providedIn: 'root' })
export class AuthentificationnServiceService {
  constructor(private http: HttpClient) {}

  userLogin(credentials: login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${AUTH_API}/login`, credentials, httpOptions
    ).pipe(
      map(res => {
        if (res.access_token) {
          console.log("Token reçu:", res.access_token); // Log pour déboguer
          localStorage.setItem('jwt', res.access_token);
          localStorage.setItem('currentUser', JSON.stringify(res.user as User));
        }
        return res;
      }),
      catchError(err => throwError(() => err))
    );
  }
  register(user: User): Observable<string> {
    return this.http.post(
      `${AUTH_API}/register`, JSON.stringify(user),
      { headers: httpOptions.headers, responseType: 'text' }
    ).pipe(catchError(err => throwError(() => err)));
  }

  updatePassword(id: number, payload: { password: string }): Observable<any> {
    return this.http.put<any>(
      `${AUTH_API}/updatepassword/${id}`, payload, httpOptions
    ).pipe(catchError(err => throwError(() => err)));
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(
      `${AUTH_API}/users?role=${role}`
    ).pipe(catchError(err => throwError(() => err)));
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(
      `${AUTH_API}/users/${id}`, httpOptions
    ).pipe(catchError(err => throwError(() => err)));
  }

  getCurrentUser(): User | null {
    const json = localStorage.getItem('currentUser');
    return json ? JSON.parse(json) as User : null;    
  }

  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentUser');
  }

  updateUserDefaultComptageType(userId: number, comptageType: number): Observable<any> {
    return this.http.put<any>(
      `${AUTH_API}/users/${userId}/comptage-type`, 
      { defaultComptageType: comptageType }, 
      httpOptions
    ).pipe(catchError(err => throwError(() => err)));
  }
}*/