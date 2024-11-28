import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { AuthGuard } from '../../auth.guard';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { AnimalDialogComponent } from '../../modals/add-animal/add-animal.component';
@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
})
export class PatientProfileComponent implements OnInit {
  patientForm!: FormGroup;
  animals: any[] = []; // Lista zwierząt pacjenta
  animalForm!: FormGroup; // Formularz do dodawania nowego zwierzęcia
  uid: string | null = null; // UID zalogowanego użytkownika

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthGuard,
    private dialog: MatDialog
  ) {}
  async openAnimalDialog(): Promise<void> {
    const dialogRef = this.dialog.open(AnimalDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addAnimal(result); // Przekazanie wyników z formularza
      }
    });
  }
  async ngOnInit(): Promise<void> {
    // Formularz pacjenta
    this.patientForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,12}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
    });

    // Formularz nowego zwierzęcia
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      breed: ['', Validators.required],
      species: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
    });

    // Pobierz dane użytkownika i pacjenta
    this.uid = await this.authService.getCurrentUserUID();
    if (this.uid) {
      this.loadPatientData();
    } else {
      console.error('User is not logged in');
    }
  }

  // Pobieranie danych pacjenta
  async loadPatientData(): Promise<void> {
    if (this.uid) {
      const patientData = await this.firebaseService.getPatientDataByUID(
        this.uid
      );
      if (patientData) {
        this.patientForm.patchValue({
          fullName: patientData.fullName,
          phoneNumber: patientData.phoneNumber,
          email: patientData.email,
        });
        this.animals = patientData.animals || [];
      } else {
        console.error('Patient data not found');
      }
    }
  }

  // Aktualizacja danych pacjenta
  async updatePatientData(): Promise<void> {
    if (this.uid && this.patientForm.valid) {
      const updatedData = {
        ...this.patientForm.value,
        animals: this.animals, // Zachowaj istniejące zwierzęta
      };
      await this.firebaseService.updateObject(
        'patients',
        this.uid,
        updatedData
      );
      alert('Patient data updated successfully!');
    }
  }

  // Dodawanie nowego zwierzęcia
  async addAnimal(newAnimal: any): Promise<void> {
    if (this.uid && newAnimal) {
      this.animals.push(newAnimal);

      const updatedData = {
        ...this.patientForm.value,
        animals: this.animals,
      };
      await this.firebaseService.updateObject(
        'patients',
        this.uid,
        updatedData
      );

      alert('Animal added successfully!');
    }
  }
}
