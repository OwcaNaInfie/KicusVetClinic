import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Database, set, ref } from '@angular/fire/database';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  specializations: string[] = [
    'Oncology',
    'Neurology',
    'Pathology',
    'Radiology',
  ];

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private db: Database,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,12}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      accountType: ['', Validators.required],
      specialization: [''],
    });

    this.registerForm.get('accountType')?.valueChanges.subscribe((value) => {
      if (value === 'doctor') {
        this.registerForm
          .get('specialization')
          ?.setValidators(Validators.required);
      } else {
        this.registerForm.get('specialization')?.clearValidators();
      }
      this.registerForm.get('specialization')?.updateValueAndValidity();
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const {
        email,
        password,
        fullName,
        phoneNumber,
        accountType,
        specialization,
      } = this.registerForm.value;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          email,
          password
        );

        const userId = userCredential.user?.uid;
        console.log('User created:', userCredential);

        if (userId) {
          if (accountType === 'patient') {
            const patientData = {
              fullName,
              phoneNumber,
              email,
              animals: [],
              scheduledAppointments: [],
              visitHistory: [],
            };

            await set(ref(this.db, `patients/${userId}`), patientData);
            console.log('Patient data saved in database');
          } else if (accountType === 'doctor') {
            const doctorData = {
              fullName,
              phoneNumber,
              email,
              specialization,
              scheduledAppointments: [],
            };

            await set(ref(this.db, `doctors/${userId}`), doctorData);
            console.log('Doctor data saved in database');
          }
        }

        const isDoctor = await this.firebaseService.getDoctorDataByUID(
          userId || ''
        );
        if (isDoctor) {
          this.router.navigate(['/doctor']);
        } else {
          this.router.navigate(['/profile']);
        }
      } catch (error) {
        console.error('Error during registration:', error);
      }
    }
  }
}
