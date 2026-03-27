import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../../../core/models/warehouse.model';
import { City, CITY_OPTIONS, Country, COUNTRY_OPTIONS } from '../../../../core/models/warehouse.model';

@Component({
  selector: 'app-warehouses',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './warehouses.component.html',
  styleUrl: './warehouses.component.css',
})
export class WarehousesComponent implements OnInit{
  private readonly warehouseService = inject(WarehouseService);
  private readonly confirmService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly dialogVisible = signal(false);
  readonly isEditing = signal(false);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  private editingId = signal<string | null>(null);

  readonly countryOptions = COUNTRY_OPTIONS;
  readonly cityOptions = CITY_OPTIONS;

  readonly dialogTitle = computed(() => this.isEditing() ? "Edit Warehouse": "Add Warehouse");

  readonly form = this.fb.group({
    name: ['', Validators.required],
    country: [null as Country | null, Validators.required],
    city: [null as City | null, Validators.required],
    totalCapacity: [0, [Validators.required, Validators.min(1)]],
  })

  ngOnInit(): void {
    this.loadWarehouses();
  }

  private loadWarehouses(): void {
    this.isLoading.set(true);
    this.warehouseService.getAll().subscribe({
      next: (data) => { 
        this.warehouses.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.showError("Failed to load warehouses");
      }
    });
  }

  openNew(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', country: null, city: null, totalCapacity: 0 });
    this.dialogVisible.set(true);
  }

  openEdit(warehouse: Warehouse): void {
    this.isEditing.set(true);
    this.editingId.set(warehouse.id);
    this.form.setValue({
      name: warehouse.name,
      country: warehouse.country,
      city: warehouse.city,
      totalCapacity: warehouse.totalCapacity
    });
    this.dialogVisible.set(true);
  }

  onSave(): void {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    const { name, country, city, totalCapacity } = this.form.getRawValue();
    this.isSaving.set(true);

    if (this.isEditing() && this.editingId()){
      this.warehouseService
      .update(this.editingId()!, {name: name!, country: country!, city: city!, totalCapacity: totalCapacity!})
      .subscribe({
        next: (updated) =>{
          this.warehouses.update(list => list.map(w => w.id === updated.id ? updated: w));
          this.dialogVisible.set(false);
          this.isSaving.set(false);
          this.showSuccess("Warehouse updated.");
        },
        error: () => {
          this.isSaving.set(false);
          this.showError("Failed to update warehouse");
        }
      });
    } else{
      this.warehouseService
      .create({ name: name!, country: country!, city: city!, totalCapacity: totalCapacity!})
      .subscribe({
        next: (created) => {
          this.warehouses.update(list => [...list, created]);
          this.dialogVisible.set(false);
          this.isSaving.set(false);
          this.showSuccess("Warehouse created");
        },
        error: () => {
          this.isSaving.set(false);
          this.showError("Failed to create warehouse.")
        }
      });
    }
  }

  confirmDelete(warehouse: Warehouse): void {
    this.confirmService.confirm({
      message: `Delete ${warehouse.name}? This cannot be undone`,
      header: 'Delete Warehouse',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.delete(warehouse.id)
    });
  }

  private delete(id: string): void {
    this.warehouseService.delete(id).subscribe({
      next: () => {
        this.warehouses.update(list => list.filter(w => w.id !== id));
        this.showSuccess("Warehouse deleted.");
      },
      error: () => this.showError("Failed to delete warehouse.")
    });
  }


  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}