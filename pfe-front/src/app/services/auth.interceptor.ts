// src/app/services/auth.interceptor.ts
// src/app/services/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {    // Skip interception for login and registration endpoints
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      console.log('Skipping auth for:', request.url);
      return next.handle(request);
    }

    // Retrieve and clean token from localStorage
    let token = localStorage.getItem('jwt');
    if (token?.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    console.log('Token after clean:', token);

    if (token) {
      // Clone the request and set the Authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Auth header present:', request.headers.get('Authorization'));
    }

    return next.handle(request);
  }
}

/**import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  // Skip interception for authentication requests
  if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
    return next.handle(request);
  }

  // Retrieve token from localStorage
  const token = localStorage.getItem('jwt');
  console.log("Token récupéré:", token);

  if (token) {
    // Cloner la requête et ajouter l'en-tête d'autorisation
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log("En-têtes après interception:", request.headers);
  }

  return next.handle(request);
}
}*/