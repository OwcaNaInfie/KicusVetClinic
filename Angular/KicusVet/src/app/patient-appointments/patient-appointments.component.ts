import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AuthGuard } from '../auth.guard';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-appointments',
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
})
export class PatientAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  upcomingAppointments: any[] = [];
  pastAppointments: any[] = [];
  doctors: any[] = [];
  constructor(
    private firebaseService: FirebaseService,
    private authGuard: AuthGuard
  ) {}

  async ngOnInit() {
    const userId = await this.authGuard.getCurrentUserUID();

    if (userId) {
      this.firebaseService.getObjectList('appointments').subscribe((data) => {
        console.log(data);
        this.appointments = data.filter(
          (appointment) => appointment.patientId === userId
        );
        this.splitAppointments();
      });
    }

    this.firebaseService.getObjectList('doctors').subscribe((data) => {
      this.doctors = data;
      console.log('DOCTORS: ', this.doctors);
    });
  }
  getDoctorFullName(doctorId: string): string {
    const doctor = this.doctors.find((doc) => doc.id === doctorId);
    return doctor ? `${doctor.fullName}` : 'Unknown Doctor';
  }
  splitAppointments() {
    const now = new Date();
    console.log('now', now);
    this.upcomingAppointments = this.appointments.filter(
      (appt) => new Date(appt.date + ' ' + appt.timeSlot) > now
    );
    this.pastAppointments = this.appointments.filter(
      (appt) => new Date(appt.date + ' ' + appt.timeSlot) <= now
    );
  }
}
