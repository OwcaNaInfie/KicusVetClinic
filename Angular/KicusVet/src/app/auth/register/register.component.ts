import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,12}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        console.log('User created:', userCredential);
      } catch (error) {
        console.error('Error during registration:', error);
      }
    }
  }
}
