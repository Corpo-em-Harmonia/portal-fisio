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
    path: 'pacientes',
    loadChildren: () =>
      import('./features/pacientes/pacientes-module')
        .then(m => m.PacientesModule)
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin-module')
        .then(m => m.AdminModule)
  },
  { path: '', redirectTo: 'pacientes', pathMatch: 'full' }
];

