// src/app/app.module.ts
import { NgModule }                     from '@angular/core';
import { BrowserModule }                from '@angular/platform-browser';
import { CommonModule }                 from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule }             from './app-routing.module';
import { AppComponent }                 from './app.component';

import { RegisterComponent }            from './views/pages/register/register.component';
import { LoginComponent }               from './views/pages/login/login.component';
import { OperatorDashboardComponent }   from './views/operator-dashboard/operator-dashboard.component';

// CoreUI (optional)
import { ButtonModule }                 from '@coreui/angular';
import { IconModule }                   from '@coreui/icons-angular';

import { AuthInterceptor }              from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    OperatorDashboardComponent,
    // … autres composants
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    ButtonModule,
    IconModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,useClass: AuthInterceptor,multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
