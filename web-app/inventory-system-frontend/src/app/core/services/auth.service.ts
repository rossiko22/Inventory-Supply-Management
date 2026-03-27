import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';

const AUTH_BASE_URL = "http://localhost:8080/auth"

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // ← Restore from sessionStorage on app load so refresh doesn't wipe the user
  private readonly _currentUser = signal<AuthUser | null>(
    this.restoreUser()
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn  = computed(() => this._currentUser() !== null);
  readonly userRole    = computed(() => this._currentUser()?.role ?? null);
  readonly isManager   = computed(() => this._currentUser()?.role === 'MANAGER');
  readonly isWorker    = computed(() => this._currentUser()?.role === 'WORKER');

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${AUTH_BASE_URL}/login`, credentials, { withCredentials: true })
      .pipe(
        tap(response => {
          this._currentUser.set(response);
          sessionStorage.setItem('current_user', JSON.stringify(response));
        })
      );
  }

  logout() {
    return this.http
      .post<void>(`${AUTH_BASE_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this._currentUser.set(null);
          sessionStorage.removeItem('current_user');
          this.router.navigate(['/login']);
        })
      );
  }

  refreshSession() {
    return this.http
      .post<LoginResponse>(`${AUTH_BASE_URL}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(response => {
          this._currentUser.set(response);
          sessionStorage.setItem('current_user', JSON.stringify(response));
        })
      );
  }

  private restoreUser(): AuthUser | null {
    try {
      const stored = sessionStorage.getItem('current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}