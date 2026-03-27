import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { InventoryItem } from '../../../core/models/inventory.model';
import { Observable } from 'rxjs';

const INVENTORY_BASE_URL = 'http://localhost:8086/inventory';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(INVENTORY_BASE_URL, { withCredentials: true });
  }
}
