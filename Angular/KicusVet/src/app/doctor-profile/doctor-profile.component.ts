import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
import { FirebaseService } from '../services/firebase.service';

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
  private apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private guard: AuthGuard,
    private firebaseService: FirebaseService
  ) {
    this.doctorForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      specialization: ['', Validators.required],
    });
  }

  async ngOnInit() {
    const doctorId = await this.guard.getCurrentUserUID();
    if (!doctorId) {
      console.error('Failed to fetch doctor ID');
      return;
    }

    this.http.get(`${this.apiUrl}/doctors/${doctorId}`).subscribe(
      (doctorData: any) => {
        if (doctorData) {
          this.doctorForm.patchValue(doctorData);
        }
      },
      (error) => console.error('Error fetching doctor data:', error)
    );

    this.http.get<any[]>(`${this.apiUrl}/list/appointments`).subscribe(
      (appointments: any[]) => {
        this.appointments = appointments.filter(
          (app) => app.doctorId === doctorId
        );
        this.filteredAppointments = [...this.appointments];
      },
      (error) => console.error('Error fetching appointments:', error)
    );
  }

  async updateDoctorData() {
    if (this.doctorForm.valid) {
      const doctorId = await this.guard.getCurrentUserUID();
      if (doctorId) {
        this.http
          .put(
            `${this.apiUrl}/update/doctors/${doctorId}`,
            this.doctorForm.value
          )
          .subscribe(
            () => {
              console.log('Doctor data updated successfully');
            },
            (error) => console.error('Error updating doctor data:', error)
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

  async openAppointmentDialog(appointment: any) {
    try {
      const patientData = await this.firebaseService.getPatientDataByUID(
        appointment.patientId
      );

      if (!patientData) {
        console.error('Nie znaleziono danych pacjenta');
        return;
      }

      const doctorData = await this.firebaseService.getDoctorDataByUID(
        appointment.doctorId
      );

      if (!doctorData) {
        console.error('Nie znaleziono danych lekarza');
        return;
      }

      const dialogData = {
        ...appointment,
        patient: patientData,
        doctor: doctorData,
      };

      const dialogRef = this.dialog.open(AppointmentEditDialogComponent, {
        width: '400px',
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((updatedAppointment) => {
        if (updatedAppointment) {
          this.http
            .put(
              `${this.apiUrl}/update/appointments/${appointment.id}`,
              updatedAppointment
            )
            .subscribe(
              () => {
                console.log('Appointment updated successfully');

                const index = this.appointments.findIndex(
                  (app) => app.id === appointment.id
                );
                if (index !== -1) {
                  this.appointments[index] = {
                    ...this.appointments[index],
                    ...updatedAppointment,
                  };

                  this.filteredAppointments = [...this.appointments];
                }
              },
              (error) => console.error('Error updating appointment:', error)
            );
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
