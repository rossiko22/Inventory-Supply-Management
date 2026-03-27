import { Component, computed, inject, signal } from '@angular/core';
import { FleetService } from '../../../fleet/services/fleet.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-vehicles',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.css',
})
export class VehiclesComponent {
    private readonly fleetService   = inject(FleetService);
  private readonly confirmService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fb             = inject(FormBuilder);

  readonly vehicles      = signal<Vehicle[]>([]);
  readonly dialogVisible = signal(false);
  readonly isEditing     = signal(false);
  readonly isLoading     = signal(false);
  readonly isSaving      = signal(false);

  private readonly editingId = signal<string | null>(null);

  readonly dialogTitle = computed(() => this.isEditing() ? 'Edit Vehicle' : 'Add Vehicle');

  readonly form = this.fb.group({
    registrationPlate: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadVehicles();
  }

  private loadVehicles(): void {
    this.isLoading.set(true);
    this.fleetService.getAllVehicles().subscribe({
      next:  (data) => { this.vehicles.set(data); this.isLoading.set(false); },
      error: ()     => { this.isLoading.set(false); this.showError('Failed to load vehicles.'); },
    });
  }

  openNew(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ registrationPlate: '' });
    this.dialogVisible.set(true);
  }

  openEdit(vehicle: Vehicle): void {
    this.isEditing.set(true);
    this.editingId.set(vehicle.id);
    this.form.setValue({ registrationPlate: vehicle.registrationPlate });
    this.dialogVisible.set(true);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { registrationPlate } = this.form.getRawValue();
    this.isSaving.set(true);

    if (this.isEditing() && this.editingId()) {
      this.fleetService
        .updateVehicle(this.editingId()!, { registrationPlate: registrationPlate! })
        .subscribe({
          next: (updated) => {
            this.vehicles.update(list => list.map(v => v.id === updated.id ? updated : v));
            this.dialogVisible.set(false);
            this.isSaving.set(false);
            this.showSuccess('Vehicle updated.');
          },
          error: () => { this.isSaving.set(false); this.showError('Failed to update vehicle.'); },
        });
    } else {
      this.fleetService
        .createVehicle({ registrationPlate: registrationPlate! })
        .subscribe({
          next: (created) => {
            this.vehicles.update(list => [...list, created]);
            this.dialogVisible.set(false);
            this.isSaving.set(false);
            this.showSuccess('Vehicle created.');
          },
          error: () => { this.isSaving.set(false); this.showError('Failed to create vehicle.'); },
        });
    }
  }

  confirmDelete(vehicle: Vehicle): void {
    this.confirmService.confirm({
      message: `Delete vehicle "${vehicle.registrationPlate}"? This cannot be undone.`,
      header:  'Delete Vehicle',
      icon:    'pi pi-exclamation-triangle',
      accept:  () => this.delete(vehicle.id),
    });
  }

  private delete(id: string): void {
    this.fleetService.deleteVehicle(id).subscribe({
      next:  () => {
        this.vehicles.update(list => list.filter(v => v.id !== id));
        this.showSuccess('Vehicle deleted.');
      },
      error: () => this.showError('Failed to delete vehicle.'),
    });
  }

  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}