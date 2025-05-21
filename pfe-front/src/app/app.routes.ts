// app.routes.ts
import { Routes } from '@angular/router';
import { ResultatComptageComponent } from './views/pages/resultat-comptage/resultat-comptage.component';
//import { DashboardComponent } from './views/dashboard/dashboard.component';
import { Page404Component } from './views/pages/page404/page404.component';
import { Page500Component } from './views/pages/page500/page500.component';
import { LoginComponent } from './views/pages/login/login.component';
import { RegisterComponent } from './views/pages/register/register.component';
///import { OperatorDashboardRoutingModule } from './views/main-dashboard/main-dashboard-routing.module';
import { OperatorDashboardComponent } from './views/main-dashboard/main-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    //component: DashboardComponent, // Directement le composant sans layout
    data: { title: 'Tableau de bord' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Connexion' }
  },

  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Inscription' }
  },
  {
    path: '404',
    component: Page404Component,
    data: { title: 'Page non trouvée' } },
{
  path: 'resultats-comptage',
  component: ResultatComptageComponent,
  data: { title: 'Résultats de Comptage' }
},
 
  {
    path: 'main-dashboard',
    component: OperatorDashboardComponent,
    //loadComponent: () => import('./views/main-dashboard/main-dashboard.component').then(m => m.OperatorDashboardComponent),
    data: { title: 'Dashboard Opérateur' }
  },
  
  {
    path: 'test-operator',
    loadComponent: () => import('./views/main-dashboard/main-dashboard.component').then(m => m.OperatorDashboardComponent),
    data: { title: 'Test Operator Dashboard' }
  },
  
  {
    path: '500',
    component: Page500Component,
    data: { title: 'Erreur serveur' }
  },
  {
    path: '**',
    redirectTo: '404'
  }
]; 