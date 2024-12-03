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
import { AnimalEditDialogComponent } from '../../modals/animal-edit-dialog/animal-edit-dialog.component';
import { doc } from 'firebase/firestore';
import { Router } from '@angular/router';
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
  appointments: any[] = []; // Lista wizyt pacjenta
  doctors: any[] = []; // Lista lekar
  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthGuard,
    private dialog: MatDialog,
    private router: Router
  ) {}
  async openAnimalDialog(): Promise<void> {
    const dialogRef = this.dialog.open(AnimalDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addAnimal(result);
      }
    });
  }
  openAnimalEditDialog(animal: any): void {
    const dialogRef = this.dialog.open(AnimalEditDialogComponent, {
      width: '600px',
      data: {
        ...animal,
        appointments: this.appointments,
        doctors: this.doctors,
      },
    });

    dialogRef.afterClosed().subscribe((updatedAnimal) => {
      if (updatedAnimal) {
        const index = this.animals.findIndex((a) => a.name === animal.name);
        if (index !== -1) {
          this.animals[index] = updatedAnimal;
          this.updatePatientData();
        }
      }
    });
  }
  async ngOnInit(): Promise<void> {
    this.firebaseService.getObjectList('doctors').subscribe((data) => {
      this.doctors = data;
      console.log('DOCTORS: ', this.doctors);
    });
    this.firebaseService.getObjectList('appointments').subscribe(
      (data) => {
        this.appointments = data.filter((a: any) => a.patientId === this.uid);
        console.log(this.appointments);
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
    this.patientForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,12}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
    });

    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      breed: ['', Validators.required],
      species: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
    });

    this.uid = await this.authService.getCurrentUserUID();
    if (this.uid) {
      this.loadPatientData();
    } else {
      console.error('User is not logged in');
    }
  }
  goToAppointments(): void {
    this.router.navigate(['/appointment']);
  }

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

  async updatePatientData(): Promise<void> {
    if (this.uid && this.patientForm.valid) {
      const updatedData = {
        ...this.patientForm.value,
        animals: this.animals,
      };
      await this.firebaseService.updateObject(
        'patients',
        this.uid,
        updatedData
      );
      alert('Patient data updated successfully!');
    }
  }

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
