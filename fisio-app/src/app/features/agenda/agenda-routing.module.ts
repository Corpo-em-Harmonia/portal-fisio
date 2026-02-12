import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaSessoesComponent } from './pages/agenda-sessoes/agenda-sessoes';

const routes: Routes = [
  { path: '', component: AgendaSessoesComponent }, // /agenda
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgendaRoutingModule {}
