import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', 'Requested');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('maps Requested status to blue badge class', () => {
    expect(component.badgeClass()).toContain('blue');
  });

  it('maps Approved status to indigo badge class', () => {
    fixture.componentRef.setInput('status', 'Approved');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('indigo');
  });

  it('maps Delivered to green', () => {
    fixture.componentRef.setInput('status', 'Delivered');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('green');
  });

  it('maps Cancelled to red', () => {
    fixture.componentRef.setInput('status', 'Cancelled');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('red');
  });
});
