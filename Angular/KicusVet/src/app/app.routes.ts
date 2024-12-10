import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
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
    canActivate: [AuthGuard],
  },
  {
    path: 'crud-test',
    loadComponent: () =>
      import('./crud-test/crud-test.component').then(
        (m) => m.CRUDTestComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profiles/patient-profile/patient-profile.component').then(
        (m) => m.PatientProfileComponent
      ),
  },
  {
    path: 'appointment',
    loadComponent: () =>
      import('./appointment/appointment.component').then(
        (m) => m.AppointmentComponent
      ),
  },
  {
    path: 'doctor',
    loadComponent: () =>
      import('./doctor-profile/doctor-profile.component').then(
        (m) => m.DoctorProfileComponent
      ),
  },
];
