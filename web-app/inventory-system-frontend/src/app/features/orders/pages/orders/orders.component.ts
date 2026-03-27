import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { MessageService } from 'primeng/api';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../../products/services/product.service';
import { WarehouseService } from '../../../warehouses/services/warehouse.service';
import { CompanyService } from '../../../companies/services/company.service';
import { FleetService } from '../../../fleet/services/fleet.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Driver } from '../../../../core/models/driver.model';
import { Order, ORDER_STATUS_FLOW, OrderStatus, STATUS_TO_INT, INT_TO_STATUS } from '../../../../core/models/order.model';
import { Product } from '../../../../core/models/product.model';
import { Warehouse } from '../../../../core/models/warehouse.model';
import { Company } from '../../../../core/models/company.model';
import { CommonModule, DatePipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CommonModule,
    DatePipe,
    DatePickerModule
  ],
  providers: [MessageService],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private readonly orderService     = inject(OrderService);
  private readonly productService   = inject(ProductService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly companyService   = inject(CompanyService);
  private readonly fleetService     = inject(FleetService);
  readonly authService              = inject(AuthService);
  private readonly messageService   = inject(MessageService);
  private readonly fb               = inject(FormBuilder);

  readonly orders            = signal<Order[]>([]);
  readonly products          = signal<Product[]>([]);
  readonly warehouses        = signal<Warehouse[]>([]);
  readonly companies         = signal<Company[]>([]);
  readonly drivers           = signal<Driver[]>([]);
  readonly dialogVisible     = signal(false);
  readonly isLoading         = signal(false);
  readonly isSaving          = signal(false);
  readonly attachedDocument  = signal<File | null>(null);
  readonly showAttachDialog  = signal(false);
  readonly currentOrder      = signal<Order | null>(null); // current order for closing
  readonly today             = new Date();

  readonly isManager = this.authService.isManager;
  readonly isWorker  = this.authService.isWorker;

  readonly productOptions   = computed(() => this.products().map(p  => ({ label: p.name,  value: p.id })));
  readonly warehouseOptions = computed(() => this.warehouses().map(w => ({ label: w.name, value: w.id })));
  readonly companyOptions   = computed(() => this.companies().map(c  => ({ label: c.name,  value: c.id })));
  readonly driverOptions    = computed(() => this.drivers().map(d   => ({ label: d.name,  value: d.id })));

  readonly form = this.fb.group({
    productId:   [null as string | null, Validators.required],
    warehouseId: [null as string | null, Validators.required],
    companyId:   [null as string | null, Validators.required],
    driverId:    [null as string | null, Validators.required],
    quantity:    [1, [Validators.required, Validators.min(1)]],
    deliveryDate: [null as string | null]
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);

    this.productService.getAllProducts().subscribe({ next: d => this.products.set(d) });
    this.warehouseService.getAll().subscribe({ next: d => this.warehouses.set(d) });
    this.companyService.getAll().subscribe({ next: d => this.companies.set(d) });
    this.fleetService.getAllDrivers().subscribe({ next: d => this.drivers.set(d) });

    this.orderService.getAll().subscribe({
      next: (data) => {
        const converted: Order[] = data.map(o => ({
          ...o,
          status: INT_TO_STATUS[Number(o.status)] as OrderStatus
        }));
        this.orders.set(converted);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.showError('Failed to load orders.'); },
    });
  }

  openNew(): void {
    this.form.reset({ productId: null, warehouseId: null, companyId: null, driverId: null, quantity: 1 });
    this.dialogVisible.set(true);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { productId, warehouseId, companyId, driverId, quantity, deliveryDate } = this.form.getRawValue();
    this.isSaving.set(true);

    console.log('deliveryDate from form:', deliveryDate); // ← what does this print?

    this.orderService.create({ productId: productId!, warehouseId: warehouseId!, companyId: companyId!, driverId: driverId!, quantity: quantity!, deliveryDate: deliveryDate ? this.formatLocalDate(deliveryDate as unknown as Date): undefined})
      .subscribe({
        next: () => {
          this.loadAll();
          this.dialogVisible.set(false);
          this.isSaving.set(false);
          this.showSuccess('Order requested.');
        },
        error: () => { this.isSaving.set(false); this.showError('Failed to create order.'); },
      });
  }

  formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00:00`;  // no UTC conversion, sends local midnight
  }

  canAdvance(order: Order): boolean {
    if (!this.isManager()) return false;
    return !!ORDER_STATUS_FLOW[order.status];
  }

  nextStatus(order: Order): OrderStatus | null {
    return ORDER_STATUS_FLOW[order.status] ?? null;
  }

  advanceStatus(order: Order | null): void {
  if (!order) return;
  const nextStr = this.nextStatus(order);
  if (!nextStr) return;

  if (nextStr === 'Closed' && !this.attachedDocument()) {
    this.currentOrder.set(order);
    this.showAttachDialog.set(true);
    return;
  }

  const nextInt = STATUS_TO_INT[nextStr];

  // If closing, upload PDF first, then update status
  if (nextStr === 'Closed' && this.attachedDocument()) {
    const formData = new FormData();
    formData.append('file', this.attachedDocument()!);
    formData.append('orderId', order.id);

    this.orderService.uploadDocument(formData).subscribe({
      next: () => this.doStatusUpdate(order, nextInt, nextStr),
      error: () => this.showError('Failed to upload document.'),
    });
  } else {
    this.doStatusUpdate(order, nextInt, nextStr);
  }
}

private doStatusUpdate(order: Order, nextInt: number, nextStr: string): void {
  this.orderService.updateStatus(order.id, nextInt).subscribe({
    next: (updated) => {
      const updatedOrder: Order = {
        ...updated,
        status: INT_TO_STATUS[Number(updated.status)] as OrderStatus
      };
      this.orders.update(list =>
        list.map(o => o.id === updatedOrder.id ? updatedOrder : o)
      );
      this.showSuccess(`Order moved to ${nextStr}.`);
      if (nextStr === 'Closed') {
        this.attachedDocument.set(null);
        this.showAttachDialog.set(false);
        this.currentOrder.set(null);
      }
    },
    error: () => this.showError('Failed to update status.'),
  });
}

  productName(id: string): string { return this.products().find(p  => p.id === id)?.name  ?? '—'; }
  warehouseName(id: string): string { return this.warehouses().find(w => w.id === id)?.name ?? '—'; }
  companyName(id: string): string { return this.companies().find(c  => c.id === id)?.name  ?? '—'; }

  private showSuccess(msg: string): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: msg, life: 3000 });
  }

  private showError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}