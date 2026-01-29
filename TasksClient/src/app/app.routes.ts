import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'teams',
    canActivate: [authGuard],
    loadChildren: () => import('./teams/teams.routes').then(m => m.teamsRoutes)
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadChildren: () => import('./projectes/projects.routes').then(m => m.projectsRoutes)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadChildren: () => import('./tasks/tasks.routes').then(m => m.tasksRoutes)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];


