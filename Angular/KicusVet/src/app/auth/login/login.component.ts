import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      try {
        const userCredential = await signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        console.log('User logged in:', userCredential);
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
  }
}
