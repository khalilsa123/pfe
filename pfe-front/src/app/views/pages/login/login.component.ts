// src/app/views/pages/login/login.component.ts
import { Component }                            from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router }                               from '@angular/router';
import { CommonModule }                         from '@angular/common';
import { AuthentificationnServiceService }      from '../../../services/authentificationn.service';
import { login, AuthResponse }                  from '../../../models/user.model';

import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective
} from '@coreui/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    CardHeaderComponent,
    ReactiveFormsModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    InputGroupComponent,
    InputGroupTextDirective,
    FormControlDirective,
    ButtonDirective
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthentificationnServiceService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    const credentials: login = this.loginForm.value;
    this.authService.userLogin(credentials).subscribe({
      next: (res: AuthResponse) => {
        console.log('Login réussi :', res);
        // Le token est déjà stocké par le service
        this.router.navigate(['/operator-dashboard']);
      },
      error: (err: any) => {
        console.error('Erreur de login :', err);
        this.errorMessage = 'Nom d’utilisateur ou mot de passe incorrect.';
      }
    });
  }
}
