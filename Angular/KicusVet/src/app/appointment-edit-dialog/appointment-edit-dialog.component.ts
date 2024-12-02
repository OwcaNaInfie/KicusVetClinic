import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EmailService } from '../email.service';

@Component({
  selector: 'app-appointment-edit-dialog',
  templateUrl: './appointment-edit-dialog.component.html',
  styleUrls: ['./appointment-edit-dialog.component.css'],
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
  standalone: true,
})
export class AppointmentEditDialogComponent {
  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AppointmentEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private emailService: EmailService
  ) {
    this.appointmentForm = this.fb.group({
      status: [data.status, Validators.required],
      date: [new Date(data.date), Validators.required],
      time: [data.time, Validators.required],
      reason: [data.reason, Validators.required],
      recommendations: [data.recommendations || '', Validators.required],
    });
  }

  saveChanges() {
    if (this.appointmentForm.valid) {
      // Email content
      const emailSubject = `Appointment Update - ${this.appointmentForm.value.status}`;
      const emailText = `Dear Patient`;
      this.emailService
        .sendEmail(
          'raishishi666@gmail.com',
          this.appointmentForm.value.date,
          'Dr. Example', // Replace with actual doctor's name
          this.appointmentForm.value.status,
          this.appointmentForm.value.reason
        )
        .subscribe(
          (response) => {
            console.log('Email sent successfully', response);
          },
          (error) => {
            console.error('Error sending email', error);
          }
        );

      // Close the dialog after saving the changes
      this.dialogRef.close(this.appointmentForm.value);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}