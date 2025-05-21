import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/pages/login/login.component';
//import { DashboardComponent } from './views/dashboard/dashboard.component';
//import { OperatorDashboardModule } from './views/main-dashboard/main-dashboard.module';
import { OperatorDashboardComponent } from './views/main-dashboard/main-dashboard.component';
import { ResultatComptageComponent } from './views/pages/resultat-comptage/resultat-comptage.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
 // { path: 'dashboard', component: DashboardComponent },
  { path: 'main-dashboard', component: OperatorDashboardComponent },
  { path: 'resultats-comptage', component: ResultatComptageComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
     useHash: true,
     anchorScrolling: 'enabled',
     scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }