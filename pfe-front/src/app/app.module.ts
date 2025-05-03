// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';  // votre module de routes
import { AppComponent } from './app.component';

// Pages
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { ResultatComptageComponent } from './views/pages/resultat-comptage/resultat-comptage.component';

// Dashboard opérateur
import { OperatorDashboardComponent } from './views/operator-dashboard/operator-dashboard.component';
// Si vous avez un module dédié, vous pouvez à la place importer :
// import { OperatorDashboardModule } from './views/operator-dashboard/operator-dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    Page404Component,
    Page500Component,
    ResultatComptageComponent,
    OperatorDashboardComponent,
  ],
  imports: [
    BrowserModule,         // Directives de base et bootstrap
    BrowserAnimationsModule, // Animations Material
    AppRoutingModule,      // Routage de l’application
    HttpClientModule,      // Pour HttpClient dans vos services
    FormsModule,           // Pour [(ngModel)] et formulaires template-driven
    ReactiveFormsModule,   // Pour formulaires réactifs
    MatSnackBarModule,     // Module Material Snackbar
    // OperatorDashboardModule, // décommentez si vous utilisez un module de fonctionnalité
  ],
  providers: [
    // Vos services sont en général fournis via `providedIn: 'root'`, 
    // vous n’avez donc rien à ajouter ici sauf cas particulier.
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
