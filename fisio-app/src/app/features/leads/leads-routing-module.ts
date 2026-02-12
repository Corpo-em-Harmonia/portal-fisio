import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsList } from './pages/leads-list/leads-list';

const routes: Routes = [
  {
    path: '',
    component: LeadsList
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadsRoutingModule { }
