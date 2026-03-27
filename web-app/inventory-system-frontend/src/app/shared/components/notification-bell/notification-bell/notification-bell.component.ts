import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNotification } from '../../../../core/models/notification.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css',
})
export class NotificationBellComponent {
  readonly svc    = inject(NotificationService);
  readonly isOpen = signal(false);

  toggle(): void { this.isOpen.update(v => !v); }

  @HostListener('document:click', ['$event'])
  onOutsideClick(e: MouseEvent): void {
    if (!(e.target as HTMLElement).closest('app-notification-bell')) {
      this.isOpen.set(false);
    }
  }

  onItemClick(n: AppNotification): void {
    if (!n.read) this.svc.markAsRead(n.id);
  }

  dotClass(s: AppNotification['severity']): string {
    return { info: 'bg-blue-500', success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500' }[s];
  }

  badgeClass(s: AppNotification['severity']): string {
    return {
      info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      error:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    }[s];
  }

  timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}