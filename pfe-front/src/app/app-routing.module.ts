import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/pages/login/login.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { OperatorDashboardModule } from './views/operator-dashboard/operator-dashboard.module';
import { OperatorDashboardComponent } from './views/operator-dashboard/operator-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'login' },
  { path: 'operator-dashboard', component : OperatorDashboardComponent}

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