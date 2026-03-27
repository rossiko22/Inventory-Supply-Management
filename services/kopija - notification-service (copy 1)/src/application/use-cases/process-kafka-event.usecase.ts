import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { KafkaEvent } from '../../domain/events/kafka-event.types';
import { createNotification, Notification, NotificationSeverity } from '../../domain/entites/notification.entity';
import { NotificationRepository } from '../../domain/repository/notification.repository';
import { NotificationBroadcaster } from '../ports/in/notification-broadcaster.port';

function mapEventToNotification(event: KafkaEvent): Notification {
  switch (event.topic) {
    case 'order.created':
      return createNotification({
        category:   'ORDER',
        severity:   'info',
        title:      'New order received',
        message:    `Order from ${event.payload.companyName} has been created.`,
        resourceId: event.payload.orderId,
      });

    case 'order.status.changed':
      return createNotification({
        category:   'ORDER',
        severity:   mapStatusToSeverity(event.payload.newStatus),
        title:      'Order status updated',
        message:    `Order #${event.payload.orderId} moved from ${event.payload.oldStatus} to ${event.payload.newStatus}.`,
        resourceId: event.payload.orderId,
      });

    case 'inventory.low':
      return createNotification({
        category:   'INVENTORY',
        severity:   'warning',
        title:      'Low stock alert',
        message:    `${event.payload.productName} is running low — ${event.payload.currentStock} units left (min: ${event.payload.minThreshold}).`,
        resourceId: event.payload.productId,
      });

    case 'inventory.out':
      return createNotification({
        category:   'INVENTORY',
        severity:   'error',
        title:      'Out of stock',
        message:    `${event.payload.productName} is completely out of stock.`,
        resourceId: event.payload.productId,
      });

    case 'warehouse.capacity':
      return createNotification({
        category:   'WAREHOUSE',
        severity:   event.payload.percentage >= 95 ? 'error' : 'warning',
        title:      'Warehouse capacity alert',
        message:    `${event.payload.warehouseName} is at ${event.payload.percentage}% capacity (${event.payload.usedCapacity}/${event.payload.totalCapacity}).`,
        resourceId: event.payload.warehouseId,
      });
  }
}

function mapStatusToSeverity(status: string): NotificationSeverity {
  switch (status.toLowerCase()) {
    case 'delivered':
    case 'closed':    return 'success';
    case 'approved':  return 'info';
    case 'rejected':
    case 'cancelled': return 'error';
    default:          return 'info';
  }
}

export class ProcessKafkaEventUseCase {
  constructor(
    private readonly repository:  NotificationRepository,
    private readonly broadcaster: NotificationBroadcaster,
  ) {}

  execute(event$: Observable<KafkaEvent>): Observable<Notification> {
    return event$.pipe(
      // 1. Pure domain transform — no side effects, no async
      map(event => mapEventToNotification(event)),

      // 2. Persist — switches to save Observable, emits the saved entity
      switchMap(notification => this.repository.save(notification)),

      // 3. Broadcast as a side effect — value passes through unchanged
      tap(notification => this.broadcaster.broadcast(notification)),
    );
  }
}