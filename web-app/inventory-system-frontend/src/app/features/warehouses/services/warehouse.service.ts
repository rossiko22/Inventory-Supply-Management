import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Observable } from 'rxjs';
import { CreateWarehouseRequest, UpdateWarehouseRequest } from '../../../core/models/warehouse.model';

const WAREHOUSE_BASE_URL = 'http://localhost:8084/warehouses';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(WAREHOUSE_BASE_URL, { withCredentials: true });
  }

  create(request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(WAREHOUSE_BASE_URL, request, { withCredentials: true });
  }

  update(id: string, request: UpdateWarehouseRequest): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${WAREHOUSE_BASE_URL}/${id}`, request, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${WAREHOUSE_BASE_URL}/${id}`, { withCredentials: true });
  }
}
