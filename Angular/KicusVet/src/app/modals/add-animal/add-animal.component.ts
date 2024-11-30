import { Component, Inject, NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-animal-dialog',
  templateUrl: './add-animal.component.html',
  styleUrls: ['./add-animal.component.css'],
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
export class AnimalDialogComponent {
  animalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AnimalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      breed: ['', Validators.required],
      species: ['', Validators.required],
      weight: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
    });
  }

  onSubmit(): void {
    if (this.animalForm.valid) {
      this.dialogRef.close(this.animalForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
