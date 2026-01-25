import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AvaliacaoRoutingModule } from './avaliacao-routing-module';
import { AvaliacaoForm } from './pages/avaliacao-form/avaliacao-form';

@NgModule({
  declarations: [
    AvaliacaoForm
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvaliacaoRoutingModule
  ]
})
export class AvaliacaoModule { }
