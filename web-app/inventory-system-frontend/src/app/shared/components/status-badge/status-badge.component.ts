import { Component, computed, input } from '@angular/core';
import { OrderStatus } from '../../../core/models/dashboard.model';

const STATUS_CLASSES: Record<OrderStatus, string> = {
  Requested:  'bg-blue-50   text-blue-600   dark:bg-blue-900/30  dark:text-blue-400',
  Approved:   'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  Delivered:  'bg-green-50  text-green-600  dark:bg-green-900/30  dark:text-green-400',
  Closed:     'bg-gray-50   text-gray-600   dark:bg-gray-800      dark:text-gray-400',
  Cancelled:  'bg-red-50    text-red-600    dark:bg-red-900/30    dark:text-red-400',
};

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  status = input.required<OrderStatus>();
  badgeClass = computed(() => STATUS_CLASSES[this.status()]);
}
