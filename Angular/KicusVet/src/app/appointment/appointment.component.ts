import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  standalone: true,
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
    MatSelectModule,
  ],
})
export class AppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  animals: any[] = [];
  doctors: any[] = [];
  availableTimeSlots: string[] = [];
  appointmentTypes = [
    'Routine Check-up',
    'Vaccination',
    'Specialist Consultation',
  ];

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authGuard: AuthGuard
  ) {
    this.appointmentForm = this.fb.group({
      animalId: ['', Validators.required],
      doctorId: ['', Validators.required],
      appointmentType: ['', Validators.required],
      date: ['', Validators.required],
      timeSlot: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPatientAnimals();
    this.loadDoctors();
  }

  async loadPatientAnimals() {
    const uid = await this.authGuard.getCurrentUserUID();
    if (uid) {
      const patientData = await this.firebaseService.getPatientDataByUID(uid);
      if (patientData) {
        this.animals = patientData.animals || [];
      }
    }
  }

  loadDoctors() {
    this.firebaseService.getObjectList('doctors').subscribe((data) => {
      this.doctors = data;
    });
  }

  async fetchAvailableTimeSlots() {
    const doctorId = this.appointmentForm.value.doctorId;
    const date = this.appointmentForm.value.date;

    if (doctorId && date) {
      this.firebaseService
        .getObjectList(`doctors/${doctorId}/bookedHours/${date}`)
        .subscribe((bookedHours) => {
          const bookedTimes = bookedHours.map((hour: any) => hour.time);
          this.availableTimeSlots = this.generateTimeSlots(
            '09:00',
            '17:00',
            bookedTimes
          );
        });
    }
  }

  generateTimeSlots(start: string, end: string, booked: string[]): string[] {
    const slots = [];
    const startTime = this.convertToMinutes(start);
    const endTime = this.convertToMinutes(end);

    for (let time = startTime; time < endTime; time += 30) {
      const slot = this.convertToTimeString(time);
      if (!booked.includes(slot)) {
        slots.push(slot);
      }
    }
    return slots;
  }

  convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  convertToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  async onSubmit() {
    if (this.appointmentForm.valid) {
      const uid = await this.authGuard.getCurrentUserUID();
      const { doctorId, date, timeSlot } = this.appointmentForm.value;

      const appointment = {
        ...this.appointmentForm.value,
        patientId: uid,
        status: 'scheduled',
      };

      // Save appointment
      await this.firebaseService.addObjectWithAutoID(
        'appointments',
        appointment
      );

      // Save booked hour to doctor's bookedHours
      await this.firebaseService.addObjectWithAutoID(
        `doctors/${doctorId}/bookedHours/${date}`,
        { time: timeSlot }
      );

      alert('Appointment successfully booked!');
      this.availableTimeSlots = []; // Reset time slots after booking
    }
  }
}
