import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/pages/home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'leads',
    loadComponent: () =>
      import('./features/leads/pages/leads-list/leads-list')
        .then(m => m.LeadsList)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/pages/admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent)
  },
  {
    path: 'leads-avaliacoes',
    loadComponent: () =>
      import('./features/fisio/pages/leads-avaliacoes/leads-avaliacoes')
        .then(m => m.LeadsAvaliacoes)
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/pages/agenda-sessoes/agenda-sessoes')
        .then(m => m.AgendaSessoesComponent)
  },
  { path: '', redirectTo: 'leads', pathMatch: 'full' }
];

