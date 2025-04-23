// src/app/views/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationnServiceService } from '../../../services/authentificationn.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmitting   = false;
  isSignUpFailed = false;
  errorMessage   = '';
  rolesAvailable: ('OPERATEUR'|'SUPERVISEUR')[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthentificationnServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const role = this.route.snapshot.queryParamMap.get('role');
    // si pas de rôle, ou rôle invalide, on retourne à login
    if (role !== 'OPERATEUR' && role !== 'SUPERVISEUR') {
      this.router.navigate(['/login']);
      return;
    }
    // seul un ADMIN peut créer un SUPERVISEUR
    const current = this.authService.getCurrentUser();
    if (!current || (role === 'SUPERVISEUR' && current.role !== 'ADMIN')) {
      this.router.navigate(['/login']);
      return;
    }
    // définissons la liste déroulante
    this.rolesAvailable = current!.role === 'ADMIN'
      ? ['OPERATEUR','SUPERVISEUR']
      : ['OPERATEUR'];

    // on force le rôle passé
    this.registerForm = this.fb.group({
      username:  ['', Validators.required],
      firstname: ['', Validators.required],
      lastname:  ['', Validators.required],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      role:      [ role, Validators.required ]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.isSignUpFailed = false;
          // après création, on revient à la liste
          this.router.navigate(['/operator-dashboard']);
        },
        error: err => {
          this.errorMessage   = err.error?.message || 'Erreur d\'inscription';
          this.isSignUpFailed = true;
        }
      })
      .add(() => this.isSubmitting = false);
  }
}
