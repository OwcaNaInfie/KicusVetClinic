import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiUrl = 'http://localhost:2137/send-update-email';

  constructor(private http: HttpClient) {}

  sendEmail(
    email: string,
    appointmentDate: string,
    doctorName: string,
    status: string,
    reason: string
  ): Observable<any> {
    const emailData = { email, appointmentDate, doctorName, status, reason };
    return this.http.post(this.apiUrl, emailData);
  }
}
