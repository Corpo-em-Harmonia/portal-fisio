import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PacientesRoutingModule } from './pacientes-routing-module';
import { PacienteList } from './pages/paciente-list/paciente-list';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PacientesRoutingModule,
    PacienteList
  ]
})
export class PacientesModule { }
