import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login', // Redirect to login if the user is not authenticated
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'front-page',
    loadComponent: () =>
      import('./front-page/front-page.component').then(
        (m) => m.FrontPageComponent
      ),
    canActivate: [AuthGuard], // Protect the front page with AuthGuard
  },
  {
    path: 'crud-test',
    loadComponent: () =>
      import('./crud-test/crud-test.component').then(
        (m) => m.CRUDTestComponent
      ),
  },
  // This default path should be removed to avoid conflict
  // { path: '', redirectTo: '/front-page', pathMatch: 'full' },
];
