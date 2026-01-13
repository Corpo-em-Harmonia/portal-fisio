import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home-module')
        .then(m => m.HomeModule)
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' } // <-- redireciona '/' para '/home'
];

