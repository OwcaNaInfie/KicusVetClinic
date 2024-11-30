import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-crud-test',
  templateUrl: './crud-test.component.html',
  styleUrls: ['./crud-test.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class CRUDTestComponent implements OnInit {
  // Lista pacjentów do wyświetlenia
  patients: any[] = [];

  // Pola dla formularza dodawania
  newPatient = {
    fullName: '',
    phoneNumber: '',
    email: '',
    animals: [],
    scheduledAppointments: [],
    visitHistory: [],
  };

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.loadPatients();
  }

  // Pobieranie listy pacjentów
  loadPatients() {
    this.firebaseService.getObjectList('patients').subscribe((patients) => {
      this.patients = patients;
      console.log('Patients loaded:', this.patients);
    });
  }

  // Dodawanie nowego pacjenta
  addPatient() {
    this.firebaseService
      .addObjectWithAutoID('patients', this.newPatient)
      .then(() => {
        console.log('Patient added successfully');
        this.newPatient = {
          fullName: '',
          phoneNumber: '',
          email: '',
          animals: [],
          scheduledAppointments: [],
          visitHistory: [],
        }; // Reset formularza
        this.loadPatients(); // Odśwież listę
      });
  }

  // Aktualizacja pacjenta
  updatePatient(id: string, updatedData: any) {
    this.firebaseService.updateObject('patients', id, updatedData).then(() => {
      console.log('Patient updated successfully');
      this.loadPatients(); // Odśwież listę
    });
  }

  // Usuwanie pacjenta
  deletePatient(id: string) {
    this.firebaseService.deleteObject('patients', id).then(() => {
      console.log('Patient deleted successfully');
      this.loadPatients(); // Odśwież listę
    });
  }
}
