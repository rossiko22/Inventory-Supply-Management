import { Injectable, OnDestroy, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, filter, map, retry, takeUntil, timer } from 'rxjs';
import { AppNotification } from '../models/notification.model';

const HTTP_URL = 'http://localhost:8088/notifications';
const WS_URL   = 'ws://localhost:9091';

interface WsMessage {
  type:     string;
  payload?: AppNotification;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http     = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();
  private readonly socket$: WebSocketSubject<WsMessage> = webSocket(WS_URL);

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount   = computed(() => this.notifications().filter(n => !n.read).length);
  readonly hasUnread     = computed(() => this.unreadCount() > 0);

  constructor() {
    this.loadHistory();
    this.listenToSocket();
  }

  private loadHistory(): void {
    this.http.get<AppNotification[]>(HTTP_URL).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next:  ns  => this.notifications.set(ns),
      error: err => console.error('[NotificationService] history failed:', err),
    });
  }

  private listenToSocket(): void {
    this.socket$.pipe(
      filter(msg => msg.type === 'NOTIFICATION' && !!msg.payload),
      map(msg => msg.payload as AppNotification),
      // Auto-reconnect with backoff — stays inside the stream, no manual timers
      retry({ delay: (_, count) => timer(Math.min(count * 1000, 10_000)) }),
      takeUntil(this.destroy$),
    ).subscribe(notification =>
      this.notifications.update(prev => [notification, ...prev])
    );
  }

  markAsRead(id: string): void {
    this.http.patch(`${HTTP_URL}/${id}/read`, {}).pipe(
      takeUntil(this.destroy$),
    ).subscribe(() =>
      this.notifications.update(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    );
  }

  markAllAsRead(): void {
    this.http.patch(`${HTTP_URL}/read-all`, {}).pipe(
      takeUntil(this.destroy$),
    ).subscribe(() =>
      this.notifications.update(prev => prev.map(n => ({ ...n, read: true })))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket$.complete();
  }
}