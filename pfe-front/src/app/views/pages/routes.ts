import { Routes } from '@angular/router';

export const routes: Routes = [
  
  {
    path: 'operator-dashboard',
    loadComponent: () => import('../operator-dashboard/operator-dashboard.component').then(m => m.OperatorDashboardComponent),
    data: { title: 'Dashboard Opérateur' }
  },
  // Ajoutez cette nouvelle route pour les résultats de comptage
  {
    path: 'resultats-comptage',
    loadComponent: () => import('../pages/resultat-comptage/resultat-comptage.component').then(m => m.ResultatComptageComponent),
    data: { title: 'Résultats de Comptage' }
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
    
  },{
    path: 'resultats-comptage',
    loadChildren: () =>
      import('./resultat-comptage/resultat-comptage.module')
        .then(m => m.ResultatComptageModule),
    data: { title: 'Résultats de Comptage' }
  },
  // Ajoutez une route par défaut pour rediriger vers login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Ajoutez une route wildcard pour gérer les URLs inexistantes
  {
    path: '**',
    redirectTo: '/404'
  }
];




