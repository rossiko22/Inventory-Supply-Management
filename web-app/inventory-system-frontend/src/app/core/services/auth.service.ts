import { HttpClient } from '@angular/common/http';
import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginRequest, LoginResponse } from '../models/auth.model';

const AUTH_BASE_URL = "/api/auth"

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


  readonly fullName = computed(() => {
    return this._currentUser()?.name ?? '';
  });

  readonly userEmail = computed(() => {
    return this._currentUser()?.email ?? '';
  });

  readonly initials = computed(() => {
    const name = this._currentUser()?.name;
    if (!name) return '';

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  });

  readonly roleLabel = computed(() => {
    const role = this._currentUser()?.role;

    return role === 'MANAGER'
      ? 'Manager'
      : role === 'WORKER'
        ? 'Worker'
        : '';
  });

  login(credentials: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${AUTH_BASE_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this._currentUser.set(response);
          sessionStorage.setItem('current_user', JSON.stringify(response));
        })
      );
  }

  logout() {
    return this.http
      .post<void>(`${AUTH_BASE_URL}/logout`, {})
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
      .post<LoginResponse>(`${AUTH_BASE_URL}/refresh`, {})
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

  clearSession() {
    this._currentUser.set(null);
    sessionStorage.removeItem('current_user');
  }

}
