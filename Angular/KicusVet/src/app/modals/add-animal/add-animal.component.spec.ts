import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalDialogComponent } from './add-animal.component';
describe('AddAnimalComponent', () => {
  let component: AnimalDialogComponent;
  let fixture: ComponentFixture<AnimalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
