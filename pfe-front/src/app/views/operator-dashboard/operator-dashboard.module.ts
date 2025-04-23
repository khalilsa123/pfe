import { NgModule }                   from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { OperatorDashboardRoutingModule } from './operator-dashboard-routing.module';
import { OperatorDashboardComponent } from './operator-dashboard.component';

@NgModule({
  declarations: [OperatorDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    OperatorDashboardRoutingModule

  ]
})
export class OperatorDashboardModule {}
   