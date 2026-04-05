import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/pages/home/homeComponent').then(m => m.Home),
  },
  {
    path: 'avaliacao',
    loadComponent: () =>
      import('./features/avaliacao/pages/avaliacao-form/avaliacao-form').then(m => m.AvaliacaoForm),
  },
  {
    path: 'leads',
    loadComponent: () =>
      import('./features/leads/pages/leads-list/leads-list').then(m => m.LeadsList),
  },
  {
    path: 'pacientes',
    redirectTo: 'leads',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/pages/admin-dashboard/admin-dashboard.component').then(
        m => m.AdminDashboardComponent
      ),
  },
  {
    path: 'agenda',
    loadComponent: () =>
      import('./features/agenda/pages/agenda-sessoes/agenda-sessoes').then(
        m => m.AgendaSessoesComponent
      ),
  },
  { path: '', redirectTo: 'leads', pathMatch: 'full' },
];
