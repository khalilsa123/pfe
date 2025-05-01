import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ResultatComptageComponent } from './resultat-comptage.component';
import { ResultatComptageRoutingModule } from './resultat-comptage-routing.module';

// Si vos components Dashboard sont standalone, vous pouvez les importer directement :
import { StatisticsDashboardComponent } from '../statistics-dashboard/statistics-dashboard.component';
import { ExportDashboardComponent } from '../export-dashboard/export-dashboard.component';

@NgModule({
  declarations: [ /* aucun si vos components sont standalone */ ],
  imports: [
    CommonModule,
    FormsModule,
    StatisticsDashboardComponent,    // import de vos standalone components
    ExportDashboardComponent,        // idem
    ResultatComptageRoutingModule
  ]
})
export class ResultatComptageModule { }
