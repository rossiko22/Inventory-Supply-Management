import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('title', 'Total Orders');
    fixture.componentRef.setInput('value', 42);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('default variant maps to default card class', () => {
    expect(component.cardClass()).toContain('gray-200');
  });

  it('primary variant maps to indigo card class', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    expect(component.cardClass()).toContain('indigo');
    expect(component.iconClass()).toContain('indigo');
  });

  it('warning variant maps to amber icon class', () => {
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();
    expect(component.iconClass()).toContain('amber');
  });
});
