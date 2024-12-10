import { Component, NO_ERRORS_SCHEMA, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AnimalDialogComponent } from '../../modals/add-animal/add-animal.component';
import { AnimalEditDialogComponent } from '../../modals/animal-edit-dialog/animal-edit-dialog.component';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthGuard } from '../../auth.guard';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss'],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class PatientProfileComponent implements OnInit {
  patientForm!: FormGroup;
  animals: any[] = [];
  appointments: any[] = [];
  doctors: any[] = [];
  uid: string | null = null;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private guard: AuthGuard
  ) {}

  async ngOnInit(): Promise<void> {
    this.patientForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{9,12}$')],
      ],
      email: ['', [Validators.required, Validators.email]],
    });

    this.uid = await this.guard.getCurrentUserUID();
    if (this.uid) {
      this.loadPatientData();
      this.loadDoctorsAndAppointments();
    } else {
      console.error('User is not logged in');
    }
  }

  async loadPatientData(): Promise<void> {
    if (this.uid) {
      this.http.get<any>(`${this.apiUrl}/patients/${this.uid}`).subscribe(
        (patientData) => {
          this.patientForm.patchValue({
            fullName: patientData.fullName,
            phoneNumber: patientData.phoneNumber,
            email: patientData.email,
          });
          this.animals = patientData.animals || [];
        },
        (error) => console.error('Error fetching patient data:', error)
      );
    }
  }

  openAnimalDialog(): void {
    const dialogRef = this.dialog.open(AnimalDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addAnimal(result);
      }
    });
  }
  updatePatientData(): void {
    if (this.patientForm.valid) {
      const updatedData = {
        ...this.patientForm.value,
        animals: this.animals,
      };
      this.http
        .put(`${this.apiUrl}/update/patients/${this.uid}`, updatedData)
        .subscribe(
          () => alert('Patient data updated successfully!'),
          (error) => console.error('Error updating patient data:', error)
        );
    } else {
      alert('Please fill out the required fields correctly.');
    }
  }
  goToAppointments(): void {
    this.router.navigate(['/appointment']);
  }
  addAnimal(newAnimal: any): void {
    if (this.uid && newAnimal) {
      const animalWithId = {
        ...newAnimal,
        id: uuidv4(),
      };

      this.animals.push(animalWithId);

      const updatedData = {
        ...this.patientForm.value,
        animals: this.animals,
      };

      this.http
        .put(`${this.apiUrl}/update/patients/${this.uid}`, updatedData)
        .subscribe(
          () => alert('Animal added successfully!'),
          (error) => console.error('Error adding animal:', error)
        );
    }
  }
  loadDoctorsAndAppointments(): void {
    this.http.get<any[]>(`${this.apiUrl}/list/doctors`).subscribe(
      (data) => {
        this.doctors = data;
      },
      (error) => console.error('Error fetching doctors:', error)
    );

    this.http.get<any[]>(`${this.apiUrl}/list/appointments`).subscribe(
      (data) => {
        this.appointments = data;
      },
      (error) => console.error('Error fetching appointments:', error)
    );
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Dialog closed with result:', result);

        if (result.action === 'save' && result.animal) {
          const updatedAnimal = result.animal;
          if (!updatedAnimal.id) {
            updatedAnimal.id = uuidv4();
          }

          const index = this.animals.findIndex(
            (a) => a.id === updatedAnimal.id
          );
          if (index !== -1) {
            this.animals[index] = updatedAnimal;
            const updatedData = {
              ...this.patientForm.value,
              animals: this.animals,
            };
            this.http
              .put(`${this.apiUrl}/update/patients/${this.uid}`, updatedData)
              .subscribe(
                () => alert('Animal updated successfully!'),
                (error) => console.error('Error updating animal:', error)
              );
          }
        } else if (result.action === 'delete' && result.id) {
          this.deleteAnimal(result.id);
        }
      }
    });
  }

  deleteAnimal(animalId: string): void {
    console.log('Deleting animal with ID:', animalId);
    if (!animalId) {
      console.error('Animal ID is required for deletion');
      return;
    }

    const index = this.animals.findIndex((animal) => animal.id === animalId);
    if (index !== -1) {
      const deleteUrl = `${this.apiUrl}/delete/patients/${this.uid}/animals/${index}`;

      this.http.delete(deleteUrl).subscribe(
        () => {
          this.animals = this.animals.filter(
            (animal) => animal.id !== animalId
          );
          const updatedData = {
            ...this.patientForm.value,
            animals: this.animals,
          };
          this.http
            .put(`${this.apiUrl}/update/patients/${this.uid}`, updatedData)
            .subscribe(
              () => alert('Animal deleted successfully!'),
              (error) =>
                console.error(
                  'Error updating patient data after animal deletion:',
                  error
                )
            );
        },
        (error) => console.error('Error deleting animal:', error)
      );
    }
  }
}
