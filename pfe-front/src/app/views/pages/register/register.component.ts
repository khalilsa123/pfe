import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    private router: Router,
    private location: Location,
    private http: HttpClient
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
      confirmPassword: ['', [Validators.required]],
      role:      [ role, Validators.required ]
    }, { validators: this.passwordMatchValidator });
  }

  // Validation personnalisée pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  registerDirectly(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    
    // Format data exactly like Postman
    const userData = {
      username: this.registerForm.value.username,
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };
    
    console.log('Sending registration data directly:', userData);
    
    // Send directly without interceptors
    this.http.post('http://localhost:8080/auth/register', userData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isSignUpFailed = false;
        this.router.navigate(['/main-dashboard']);
      },
      error: (err) => {
        console.error('Direct registration error:', err);
        this.errorMessage = err.error?.message || 'Error registering';
        this.isSignUpFailed = true;
      }
    }).add(() => this.isSubmitting = false);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.isSubmitting = true;
    console.log('Registration data:', this.registerForm.value); // Log form data
    
    const userData = {
      username: this.registerForm.value.username,
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };

    this.authService.register(userData)
      .subscribe({
        next: () => {
          console.log('Registration successful');
          this.isSignUpFailed = false;
          this.router.navigate(['/main-dashboard']);
        },
        error: err => {
          console.error('Registration error:', err); // Log the full error
          this.errorMessage = err.error?.message || 'Registration error';
          this.isSignUpFailed = true;
        }
      })
      .add(() => this.isSubmitting = false);
  }
   
  // Ajout de la méthode goBack pour le bouton retour
  goBack(): void {
    this.location.back();
  }
}