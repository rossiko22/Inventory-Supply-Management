import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from '../../../core/models/company.model';

const COMPANY_BASE_URL = 'http://localhost:8082/companies';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(COMPANY_BASE_URL, { withCredentials: true });
  }

  create(request: CreateCompanyRequest): Observable<Company> {
    return this.http.post<Company>(COMPANY_BASE_URL, request, { withCredentials: true });
  }

  update(id: string, request: UpdateCompanyRequest): Observable<Company> {
    return this.http.put<Company>(`${COMPANY_BASE_URL}/${id}`, request, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${COMPANY_BASE_URL}/${id}`, { withCredentials: true });
  }
}