import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRUDTestComponent } from './crud-test.component';

describe('CrudTestComponent', () => {
  let component: CRUDTestComponent;
  let fixture: ComponentFixture<CRUDTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRUDTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CRUDTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
