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
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule
import { Router } from '@angular/router';

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
    MatSelectModule, // Include MatSelectModule
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private db: Database,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,12}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      accountType: ['', Validators.required], // New field for account type
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { email, password, fullName, phoneNumber, accountType } =
        this.registerForm.value;

      try {
        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          email,
          password
        );

        const userId = userCredential.user?.uid;
        console.log('User created:', userCredential);

        // Save account data based on account type
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
              specialization: '',
              scheduledAppointments: [],
            };

            await set(ref(this.db, `doctors/${userId}`), doctorData);
            console.log('Doctor data saved in database');
          }
        }

        // Navigate to the front page
        this.router.navigate(['/front-page']);
      } catch (error) {
        console.error('Error during registration:', error);
      }
    }
  }
}
