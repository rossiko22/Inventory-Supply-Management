import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateVehicleRequest, UpdateVehicleRequest, Vehicle } from '../../../core/models/vehicle.model';
import { CreateDriverRequest, Driver, UpdateDriverRequest } from '../../../core/models/driver.model';

const FLEET_BASE_URL = 'http://localhost:8083';

@Injectable({
  providedIn: 'root',
})
export class FleetService {
    private readonly http = inject(HttpClient);

  // ── Vehicles ──────────────────────────────────────────────
  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${FLEET_BASE_URL}/vehicles`, { withCredentials: true });
  }

  createVehicle(request: CreateVehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${FLEET_BASE_URL}/vehicles`, request, { withCredentials: true });
  }

  updateVehicle(id: string, request: UpdateVehicleRequest): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${FLEET_BASE_URL}/vehicles/${id}`, request, { withCredentials: true });
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${FLEET_BASE_URL}/vehicles/${id}`, { withCredentials: true });
  }

  // ── Drivers ───────────────────────────────────────────────
  getAllDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${FLEET_BASE_URL}/drivers`, { withCredentials: true });
  }

  createDriver(request: CreateDriverRequest): Observable<Driver> {
    return this.http.post<Driver>(`${FLEET_BASE_URL}/drivers`, request, { withCredentials: true });
  }

  updateDriver(id: string, request: UpdateDriverRequest): Observable<Driver> {
    return this.http.put<Driver>(`${FLEET_BASE_URL}/drivers/${id}`, request, { withCredentials: true });
  }

  deleteDriver(id: string): Observable<void> {
    return this.http.delete<void>(`${FLEET_BASE_URL}/drivers/${id}`, { withCredentials: true });
  }
}
