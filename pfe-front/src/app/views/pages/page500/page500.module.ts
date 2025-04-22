// src/app/views/pages/page500/page500.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Page500Component } from './page500.component';
import { ButtonModule } from '@coreui/angular';

@NgModule({
  declarations: [Page500Component],
  imports: [CommonModule, ButtonModule],
})
export class Page500Module { }