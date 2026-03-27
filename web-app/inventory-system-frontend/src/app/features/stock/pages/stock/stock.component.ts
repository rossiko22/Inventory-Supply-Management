import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { MessageService } from 'primeng/api';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../../products/services/product.service';
import { WarehouseService } from '../../../warehouses/services/warehouse.service';
import { InventoryItem } from '../../../../core/models/inventory.model';
import { Product } from '../../../../core/models/product.model';
import { Warehouse } from '../../../../core/models/warehouse.model';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './stock.component.html',
})
export class StockComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly productService   = inject(ProductService);
  private readonly warehouseService = inject(WarehouseService);
  private readonly messageService   = inject(MessageService);

  readonly inventory      = signal<InventoryItem[]>([]);
  readonly products       = signal<Product[]>([]);
  readonly warehouses     = signal<Warehouse[]>([]);
  readonly isLoading      = signal(false);
  readonly searchQuery    = signal('');
  readonly selectedWarehouse = signal('all');

  readonly warehouseOptions = computed(() => [
    { label: 'All Warehouses', value: 'all' },
    ...this.warehouses().map(w => ({ label: w.name, value: w.id })),
  ]);

  readonly filtered = computed(() => {
    const q  = this.searchQuery().toLowerCase();
    const wh = this.selectedWarehouse();

    return this.inventory()
      .filter(item => wh === 'all' || item.warehouseId === wh)
      .filter(item => {
        const product = this.productName(item.productId).toLowerCase();
        return product.includes(q);
      });
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({ next: d => this.products.set(d) });
    this.warehouseService.getAll().subscribe({ next: d => this.warehouses.set(d) });
    this.inventoryService.getAll().subscribe({
      next:  (data) => { this.inventory.set(data); this.isLoading.set(false); },
      error: ()     => { this.isLoading.set(false); },
    });
  }

  exportCsv(): void {
    const rows = [['Product', 'SKU', 'Warehouse', 'Quantity'].join(',')];
    this.filtered().forEach(item => {
      const product   = this.products().find(p => p.id === item.productId);
      const warehouse = this.warehouseName(item.warehouseId);
      rows.push([product?.name ?? '—', product?.sku ?? '—', warehouse, item.quantity].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'stock-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  productName(productId: string):   string { return this.products().find(p  => p.id === productId)?.name  ?? '—'; }
  productSku(productId: string):    string { return this.products().find(p  => p.id === productId)?.sku   ?? '—'; }
  warehouseName(warehouseId: string): string { return this.warehouses().find(w => w.id === warehouseId)?.name ?? '—'; }
}