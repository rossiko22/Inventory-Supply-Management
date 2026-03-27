import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, TemplateRef } from '@angular/core';

export type StatCardVariant = 'default' | 'primary' | 'accent' | 'warning' | 'success';

const CARD_CLASSES: Record<StatCardVariant, string> = {
  default: 'border-gray-200 dark:border-gray-700',
  primary: 'border-indigo-200 dark:border-indigo-800',
  accent:  'border-emerald-200 dark:border-emerald-800',
  warning: 'border-amber-200 dark:border-amber-800',
  success: 'border-teal-200 dark:border-teal-800',
};

const ICON_CLASSES: Record<StatCardVariant, string> = {
  default: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  primary: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
  accent:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  success: 'bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
};

@Component({
  selector: 'app-stat-card',
  imports: [NgTemplateOutlet],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  title = input.required<string>();
  value = input.required<string | number>();
  variant = input<StatCardVariant>('default');
  trend = input<string>();
  iconTemplate = input<TemplateRef<void>>();

  cardClass = computed(() => CARD_CLASSES[this.variant()]);
  iconClass = computed(() => ICON_CLASSES[this.variant()]);
  
}
