// src/app/views/pages/login/login.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { ButtonModule } from '@coreui/angular'; // Pour les styles CoreUI
// Removed unnecessary dynamic import
@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, FormsModule, ButtonModule],
})
export class LoginModule { }

