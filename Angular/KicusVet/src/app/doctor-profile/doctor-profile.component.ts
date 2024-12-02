import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentEditDialogComponent } from '../appointment-edit-dialog/appointment-edit-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthGuard } from '../auth.guard';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DoctorProfileComponent implements OnInit {
  doctorForm: FormGroup;
  appointments: any[] = [];
  filteredAppointments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private dialog: MatDialog,
    private guard: AuthGuard
  ) {
    this.doctorForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      specialization: ['', Validators.required],
    });
  }

  async ngOnInit() {
    const doctorId = await this.guard.getCurrentUserUID(); // Get current doctor ID
    if (!doctorId) {
      console.error('Failed to fetch doctor ID');
      return;
    }

    const doctorData = await this.firebaseService.getDoctorDataByUID(doctorId); // Fetch doctor data
    if (doctorData) {
      this.doctorForm.patchValue(doctorData); // Set form fields with actual data
    }

    this.firebaseService
      .getObjectList(`appointments`)
      .subscribe((appointments) => {
        this.appointments = appointments.filter(
          (app) => app.doctorId === doctorId
        );
        this.filteredAppointments = [...this.appointments];
      });
  }

  async updateDoctorData() {
    if (this.doctorForm.valid) {
      const doctorId = await this.guard.getCurrentUserUID();
      if (doctorId) {
        this.firebaseService.updateObject(
          'doctors',
          doctorId,
          this.doctorForm.value
        );
      } else {
        console.error('Failed to get current user ID');
      }
    }
  }

  onDateChange(date: Date | null) {
    this.filteredAppointments = date
      ? this.appointments.filter(
          (app) => new Date(app.date).toDateString() === date.toDateString()
        )
      : [...this.appointments];
  }

  openAppointmentDialog(appointment: any) {
    const dialogRef = this.dialog.open(AppointmentEditDialogComponent, {
      width: '400px',
      data: appointment,
    });

    dialogRef.afterClosed().subscribe((updatedAppointment) => {
      if (updatedAppointment) {
        this.firebaseService.updateObject(
          'appointments',
          appointment.id,
          updatedAppointment
        );
      }
    });
  }
}
