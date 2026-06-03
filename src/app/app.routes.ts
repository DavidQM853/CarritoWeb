import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
  },
  {
    path: 'analisis',
    loadComponent: () => import('./pages/analisis/analisis.page').then(m => m.AnalisisPage),
  },
  {
    path: 'sesiones',
    loadComponent: () => import('./pages/sesiones/sesiones.page').then(m => m.SesionesPage),
  },
  {
    path: 'log-eventos',
    loadComponent: () => import('./pages/log-eventos/log-eventos.page').then(m => m.LogEventosPage),
  },
  {
    path: 'base-datos',
    loadComponent: () => import('./pages/base-datos/base-datos.page').then(m => m.BaseDatosPage),
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/configuracion/configuracion.page').then(m => m.ConfiguracionPage),
  },
];