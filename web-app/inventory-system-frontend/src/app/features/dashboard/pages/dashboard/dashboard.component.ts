import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Product, StockByWarehouse, WeekDay } from '../../../../core/models/dashboard.model';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ChartModule } from 'primeng/chart';
import { HttpClient } from '@angular/common/http';
import { Warehouse } from '../../../../core/models/warehouse.model';
import { INT_TO_STATUS, mapOrder, Order, OrderApiResponse, STATUS_TO_INT } from '../../../../core/models/order.model';
import { Company } from '../../../../core/models/company.model';
import { getWeekRange } from '../../../../core/utils/date.utils';
import {WarehouseService} from '../../../warehouses/services/warehouse.service';
import {CompanyService} from '../../../companies/services/company.service';
import {OrderService} from '../../../orders/services/order.service';


const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

@Component({
  selector: 'app-dashboard',
  imports: [NgTemplateOutlet, StatCardComponent, StatusBadgeComponent, PageHeaderComponent, ChartModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit{
  private readonly warehouseService: WarehouseService = inject(WarehouseService);
  private readonly companyService: CompanyService = inject(CompanyService);
  private readonly orderService: OrderService = inject(OrderService);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly companies = signal<Company[]>([]);
  readonly orders = signal<Order[]>([]);

  readonly totalOrders = computed(() => this.orders().length);
  readonly pending   = computed(() => this.orders().filter(o => o.status === "Requested").length);
  readonly approved  = computed(() => this.orders().filter(o => o.status === "Approved").length);
  readonly delivered = computed(() => this.orders().filter(o => o.status === "Delivered" || o.status === "Closed").length);
  readonly warehouseCount = computed(() => this.warehouses().length);
  readonly companyCount = computed(() => this.companies().length);
  readonly recentOrders = computed(() =>
    this.orders()
      .slice()
      .sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 5)
  );

  formatCreatedDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);

    const month   = date.toLocaleDateString('en-US', { month: 'long' });  // Mar
    const day     = date.getDate().toString().padStart(2, '0');             // 27
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }); // Friday
    const hours   = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${month} ${day}, ${weekday}  ${hours}:${minutes}`;
    // → Mar 27, Fri  00:09
  }

    formatDeliveryDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);

    const month   = date.toLocaleDateString('en-US', { month: 'long' });  // Mar
    const day     = date.getDate().toString().padStart(2, '0');             // 27
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }); // Friday

    return `${month} ${day}, ${weekday}`;
    // → Mar 27, Fri
  }

  ngOnInit(): void {

    this.warehouseService.getAll()
      .subscribe({
          next: res => this.warehouses.set(res),
           error: err => console.log("Failed to fetch total warehouses ", err),
      });

    this.companyService.getAll()
      .subscribe({
          next: res => this.companies.set(res),
           error: err => console.log("Failed to fetch total companies ", err),
      });

    this.orderService.getAll().subscribe({
      next: (res: Order[]) => this.orders.set(res),  // ← already mapped, just set it
      error: err => console.error('Failed to fetch orders', err),
    });

  }

// 2. Replace the barChartData computed signal with this
readonly barChartData = computed(() => {
  const { monday, sunday } = getWeekRange(new Date());

  // Build one slot per day Mon–Sun
  const counts = Array(7).fill(0);

  for (const order of this.orders()) {
    if (!order.deliveryDate) continue;
    const d = new Date(order.deliveryDate);
    if (d < monday || d > sunday) continue;

    // dayOfWeek: Mon=1…Sun=0 → index Mon=0…Sun=6
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    counts[idx]++;
  }

  return {
    labels: DAY_LABELS,
    datasets: [{
      label: 'Deliveries',
      data: counts,
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };
});


   readonly barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 12 } }, beginAtZero: true },
    },
  };


  readonly pieChartData = computed(() => {
    const stockByWarehouse: StockByWarehouse[] = this.warehouses().map(w => ({
      name: w.name,
      value: w.usedCapacity
    }));


    return {
      labels: stockByWarehouse.map(s => s.name.replace(' Warehouse', '')),
      datasets: [{
        data: stockByWarehouse.map(s => s.value),
        backgroundColor: [
          'hsl(221,83%,53%)',
          'hsl(160,84%,39%)',
          'hsl(38,92%,50%)',
          'hsl(280,65%,60%)',
        ],
        hoverOffset: 6,
      }],
    };
  });

  readonly pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
    },
  };

  warehouseName(warehouseId: string): string {
    return this.warehouses().find(w => w.id === warehouseId)?.name ?? '—';
  }
  companyName(companyId: string): string {
    return this.companies().find(c => c.id === companyId)?.name ?? '—';
  }

  protected readonly INT_TO_STATUS = INT_TO_STATUS;
}
