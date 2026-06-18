import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/app-shell/app-shell.component').then(
        (m) => m.AppShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'exercises', pathMatch: 'full' },
      {
        path: 'exercises',
        loadComponent: () =>
          import('./features/exercises/exercise-list/exercise-list.component').then(
            (m) => m.ExerciseListComponent,
          ),
      },
      {
        path: 'exercises/new',
        loadComponent: () =>
          import('./features/exercises/exercise-form/exercise-form.component').then(
            (m) => m.ExerciseFormComponent,
          ),
      },
      {
        path: 'exercises/:id/edit',
        loadComponent: () =>
          import('./features/exercises/exercise-form/exercise-form.component').then(
            (m) => m.ExerciseFormComponent,
          ),
      },
      {
        path: 'workouts/history',
        loadComponent: () =>
          import('./features/workouts/workout-history/workout-history.component').then(
            (m) => m.WorkoutHistoryComponent,
          ),
      },
      {
        path: 'workouts/register',
        loadComponent: () =>
          import('./features/workouts/workout-register/workout-register.component').then(
            (m) => m.WorkoutRegisterComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
