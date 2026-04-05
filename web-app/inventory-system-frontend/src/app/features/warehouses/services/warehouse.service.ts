import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Warehouse } from '../../../core/models/warehouse.model';
import { Observable } from 'rxjs';
import { CreateWarehouseRequest, UpdateWarehouseRequest } from '../../../core/models/warehouse.model';

const WAREHOUSE_BASE_URL = '/api/warehouses';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(WAREHOUSE_BASE_URL);
  }

  create(request: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(WAREHOUSE_BASE_URL, request);
  }

  update(id: string, request: UpdateWarehouseRequest): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${WAREHOUSE_BASE_URL}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${WAREHOUSE_BASE_URL}/${id}`);
  }
}
