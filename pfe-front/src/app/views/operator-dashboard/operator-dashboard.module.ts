// src/app/views/pages/operator-dashboard/operator-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperatorDashboardComponent } from './operator-dashboard.component';
import { OperatorDashboardRoutingModule } from './operator-dashboard-routing.module';
// Exemple d'import pour des styles ou composants CoreUI
import { ButtonModule } from '@coreui/angular';


@NgModule({
  declarations: [OperatorDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    OperatorDashboardRoutingModule
  ]
})

export class OperatorDashboardModule { }



