import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Driver } from '../../../../core/models/driver.model';
import { FleetService } from '../../../fleet/services/fleet.service';
import { CompanyService } from '../../../companies/services/company.service';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { Company } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-drivers',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css',
})
export class DriversComponent {
    private readonly fleetService   = inject(FleetService);
  private readonly companyService = inject(CompanyService);
  private readonly confirmService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fb             = inject(FormBuilder);

  readonly drivers       = signal<Driver[]>([]);
  readonly vehicles      = signal<Vehicle[]>([]);
  readonly companies     = signal<Company[]>([]);
  readonly dialogVisible = signal(false);
  readonly isEditing     = signal(false);
  readonly isLoading     = signal(false);
  readonly isSaving      = signal(false);

  private readonly editingId = signal<string | null>(null);

  readonly dialogTitle = computed(() => this.isEditing() ? 'Edit Driver' : 'Add Driver');

  // Dropdown options derived from loaded data
  readonly vehicleOptions  = computed(() =>
    this.vehicles().map(v => ({ label: v.registrationPlate, value: v.id }))
  );
  readonly companyOptions  = computed(() =>
    this.companies().map(c => ({ label: c.name, value: c.id }))
  );

  readonly form = this.fb.group({
    name:      ['', Validators.required],
    phone:     ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    vehicleId: [null as string | null, Validators.required],
    companyId: [null as string | null, Validators.required],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);

    this.fleetService.getAllDrivers().subscribe({
      next:  (data) => this.drivers.set(data),
      error: ()     => this.showError('Failed to load drivers.'),
    });

    this.fleetService.getAllVehicles().subscribe({
      next: (data) => this.vehicles.set(data),
    });

    this.companyService.getAll().subscribe({
      next:  (data) => { this.companies.set(data); this.isLoading.set(false); },
      error: ()     => this.isLoading.set(false),
    });
  }

  openNew(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', phone: '', email: '', vehicleId: null, companyId: null });
    this.dialogVisible.set(true);
  }

  openEdit(driver: Driver): void {
    this.isEditing.set(true);
    this.editingId.set(driver.id);
    this.form.setValue({
      name:      driver.name,
      phone:     driver.phone,
      email:     driver.email,
      vehicleId: driver.vehicleId,
      companyId: driver.companyId,
    });
    this.dialogVisible.set(true);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, phone, email, vehicleId, companyId } = this.form.getRawValue();
    this.isSaving.set(true);

    if (this.isEditing() && this.editingId()) {
      this.fleetService
        .updateDriver(this.editingId()!, {
          name: name!, phone: phone!, email: email!,
          vehicleId: vehicleId!, companyId: companyId!,
        })
        .subscribe({
          next: (updated) => {
            this.drivers.update(list => list.map(d => d.id === updated.id ? updated : d));
            this.dialogVisible.set(false);
            this.isSaving.set(false);
            this.showSuccess('Driver updated.');
          },
          error: () => { this.isSaving.set(false); this.showError('Failed to update driver.'); },
        });
    } else {
      this.fleetService
        .createDriver({
          name: name!, phone: phone!, email: email!,
          vehicleId: vehicleId!, companyId: companyId!,
        })
        .subscribe({
          next: (created) => {
            this.drivers.update(list => [...list, created]);
            this.dialogVisible.set(false);
            this.isSaving.set(false);
            this.showSuccess('Driver created.');
          },
          error: () => { this.isSaving.set(false); this.showError('Failed to create driver.'); },
        });
    }
  }

  confirmDelete(driver: Driver): void {
    this.confirmService.confirm({
      message: `Delete driver "${driver.name}"? This cannot be undone.`,
      header:  'Delete Driver',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => this.delete(driver.id),
    });
  }

  private delete(id: string): void {
    this.fleetService.deleteDriver(id).subscribe({
      next:  () => {
        this.drivers.update(list => list.filter(d => d.id !== id));
        this.showSuccess('Driver deleted.');
      },
      error: () => this.showError('Failed to delete driver.'),
    });
  }

  vehiclePlate(vehicleId: string): string {
    return this.vehicles().find(v => v.id === vehicleId)?.registrationPlate ?? '—';
  }

  companyName(companyId: string): string {
    return this.companies().find(c => c.id === companyId)?.name ?? '—';
  }

  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}
