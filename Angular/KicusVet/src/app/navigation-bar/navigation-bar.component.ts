import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
  ],
})
export class NavigationBarComponent {
  @Input() role: 'patient' | 'doctor' = 'patient';

  patientRoutes = [
    { path: '/appointment', label: 'Appointment' },
    { path: '/profile', label: 'Profile' },
  ];

  doctorRoutes = [{ path: '/doctor', label: 'Doctor' }];
  constructor(private router: Router) {}

  get routes() {
    return this.role === 'doctor' ? this.doctorRoutes : this.patientRoutes;
  }
  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
