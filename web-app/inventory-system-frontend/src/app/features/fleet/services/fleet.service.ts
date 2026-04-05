import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateVehicleRequest, UpdateVehicleRequest, Vehicle } from '../../../core/models/vehicle.model';
import { CreateDriverRequest, Driver, UpdateDriverRequest } from '../../../core/models/driver.model';

const DRIVERS_BASE_URL = '/api/drivers';
const VEHICLES_BASE_URL = '/api/vehicles';

@Injectable({
  providedIn: 'root',
})
export class FleetService {
    private readonly http = inject(HttpClient);

  // ── Vehicles ──────────────────────────────────────────────
  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(VEHICLES_BASE_URL, { withCredentials: true });
  }

  createVehicle(request: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(VEHICLES_BASE_URL, request);
  }

  updateVehicle(id: string, request: UpdateVehicleRequest): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${VEHICLES_BASE_URL}/${id}`, request);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${VEHICLES_BASE_URL}/${id}`);
  }

  // ── Drivers ───────────────────────────────────────────────
  getAllDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(DRIVERS_BASE_URL);
  }

  createDriver(request: CreateDriverRequest): Observable<Driver> {
    return this.http.post<Driver>(DRIVERS_BASE_URL, request);
  }

  updateDriver(id: string, request: UpdateDriverRequest): Observable<Driver> {
    return this.http.put<Driver>(`${DRIVERS_BASE_URL}/${id}`, request);
  }

  deleteDriver(id: string): Observable<void> {
    return this.http.delete<void>(`${DRIVERS_BASE_URL}/${id}`);
  }
}
