import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehousesComponent } from './warehouses.component';

describe('WarehousesComponent', () => {
  let component: WarehousesComponent;
  let fixture: ComponentFixture<WarehousesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehousesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehousesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
