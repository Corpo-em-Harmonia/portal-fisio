import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvaliacaoForm } from './pages/avaliacao-form/avaliacao-form';

const routes: Routes = [
  {
    path: 'form',
    component: AvaliacaoForm
  },
  {
    path: '',
    redirectTo: 'form',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AvaliacaoRoutingModule { }
