import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
export interface Appointment {
  id?: string;
  animalId?: any;
  patientId?: string;
  doctorId: string;
  status?: string;
}
@Component({
  selector: 'app-animal-edit-dialog',
  templateUrl: './animal-edit-dialog.component.html',
  styleUrls: ['./animal-edit-dialog.component.css'],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatListModule,
  ],
  standalone: true,
})
export class AnimalEditDialogComponent {
  animalForm: FormGroup;
  appointments: any[] = [];
  doctors: any[] = [];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AnimalEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data);
    this.animalForm = this.fb.group({
      name: [data.name, Validators.required],
      age: [data.age, [Validators.required, Validators.min(0)]],
      breed: [data.breed, Validators.required],
      species: [data.species, Validators.required],
      weight: [data.weight, [Validators.required, Validators.min(0)]],
      notes: [data.notes],
    });
    this.appointments =
      data?.appointments?.filter((appointment: Appointment) => {
        return appointment.animalId.name === this.animalForm.value.name;
      }) || [];
    this.doctors = data?.doctors || [];
  }

  getDoctorFullName(doctorId: string): string {
    const doctor = this.doctors.find((doc) => doc.id === doctorId);
    return doctor ? `${doctor.fullName}` : 'Unknown Doctor';
  }
  saveChanges(): void {
    if (this.animalForm.valid) {
      this.dialogRef.close({
        action: 'save',
        animal: { ...this.animalForm.value, id: this.data.id },
      });
    }
  }
  confirmDelete(): void {
    this.dialogRef.close({ action: 'delete', id: this.data.id });
  }
  closeDialog(): void {
    this.dialogRef.close();
  }
}
