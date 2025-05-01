import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResultatComptageComponent } from './resultat-comptage.component';

const routes: Routes = [
  {
    path: '',
    component: ResultatComptageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultatComptageRoutingModule { }
