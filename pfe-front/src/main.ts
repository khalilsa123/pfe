/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { provideRouter }      from '@angular/router';

import { AppComponent }       from './app/app.component';
import { routes }             from './app/views/pages/routes';
import { AuthInterceptor }    from './app/services/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),

    // Provide HttpClient and wire up DI-based interceptors
    provideHttpClient(
      withInterceptorsFromDi()    
    ),   

    // Register your JWT/Auth interceptor
    {     
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
.catch(err => console.error(err));
