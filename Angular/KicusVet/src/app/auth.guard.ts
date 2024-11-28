import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          subscriber.next(true); // Allow navigation
        } else {
          this.router.navigate(['/login']); // Redirect to login
          subscriber.next(false); // Prevent navigation
        }
        subscriber.complete(); // Close the Observable
      });
    });
  }
  getCurrentUserUID(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null);
        }
      });
    });
  }
}
