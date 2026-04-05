import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateOrderRequest, Order, OrderStatus, STATUS_TO_INT } from '../../../core/models/order.model';
import { Observable } from 'rxjs';

const ORDER_BASE_URL = '/api/orders';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
   private readonly http = inject(HttpClient);

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(ORDER_BASE_URL);
  }

  create(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(ORDER_BASE_URL, request);
  }

  updateStatus(orderId: string, status: number): Observable<Order> {
    return this.http.put<Order>(ORDER_BASE_URL + `/status`, { orderId, status });
  }

  uploadDocument(formData: FormData): Observable<void> {
  return this.http.post<void>(`${ORDER_BASE_URL}/upload-document`, formData);
  }
}

