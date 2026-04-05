import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateOrderRequest,
  mapOrder,
  Order,
  OrderApiResponse,
  OrderStatus,
  STATUS_TO_INT
} from '../../../core/models/order.model';
import {map, Observable} from 'rxjs';

const ORDER_BASE_URL = '/api/orders';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
   private readonly http = inject(HttpClient);

  getAll(): Observable<Order[]> {
    return this.http.get<OrderApiResponse[]>(ORDER_BASE_URL)
      .pipe(map(res => res.map(mapOrder))); // convert number → string here
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

