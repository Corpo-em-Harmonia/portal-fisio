import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home-module')
        .then(m => m.HomeModule)
  },
  {
    path: 'avaliacao',
    loadChildren: () =>
      import('./features/avaliacao/avaliacao-module')
        .then(m => m.AvaliacaoModule)
  },
  {
    path: 'leads',
    loadChildren: () =>
      import('./features/leads/leads-module')
        .then(m => m.LeadsModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin-module')
        .then(m => m.AdminModule)
  },
  {
    path: 'agenda',
    loadChildren: () =>
      import('./features/agenda/agenda-module')
    .then(m => m.AgendaModule)
  },
  { path: '', redirectTo: 'leads', pathMatch: 'full' }
];

