// src/app/views/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthentificationnServiceService } from '../../../services/authentificationn.service';
import { RouterModule }                    from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,                      // ← mark it standalone
  imports: [
    CommonModule,                        // ← for *ngIf, *ngFor…
    ReactiveFormsModule,                 // ← for formGroup, formControlName…
    RouterModule                         // ← if you ever use routerLink in this template
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting   = false;
  isSuccessful   = false;
  isSignUpFailed = false;
  errorMessage   = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthentificationnServiceService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username:  ['', Validators.required],
      firstname: ['', Validators.required],
      lastname:  ['', Validators.required],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      role:      ['OPERATEUR', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isSuccessful   = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage   = err.error?.message || 'Erreur d\'inscription';
        this.isSignUpFailed = true;
      }
    }).add(() => this.isSubmitting = false);
  }
}



/**import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthentificationnServiceService } from '../../../services/authentificationn.service'; // Corrected import
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule // Only keep the necessary import
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isSuccessful = false;
  isSignUpFailed = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthentificationnServiceService, // Corrected service name
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
     // email: ['', [Validators.required, Validators.email]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      const user: User = {
        ...this.registerForm.value,
        role: 0 // Role par défaut
      };

      this.authService.register(user).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.isSuccessful = true;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.isSignUpFailed = true;
          this.errorMessage = err.message || 'Registration failed';
          console.error('Registration error:', err);
        }
      });
    }
}
  onLogin(): void {
    this.router.navigate(['/login']);
  }
}*/