import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse } from '../models/auth.model';

function setupTestBed() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
    ],
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    setupTestBed();
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('starts logged out when sessionStorage empty', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('login stores user in signal and sessionStorage', () => {
    const response: LoginResponse = {
      id: 'u-1', email: 'a@x.com', name: 'Alice Smith', role: 'MANAGER',
    };

    service.login({ email: 'a@x.com', password: 'pw' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(service.isLoggedIn()).toBe(true);
    expect(service.userRole()).toBe('MANAGER');
    expect(service.userEmail()).toBe('a@x.com');
    expect(JSON.parse(sessionStorage.getItem('current_user')!)).toEqual(response);
  });

  it('initials returns empty when no user', () => {
    expect(service.initials()).toBe('');
  });

  it('logout sends POST and clears state', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'a@x.com', name: 'A', role: 'MANAGER' }));
    TestBed.resetTestingModule();
    setupTestBed();
    const fresh = TestBed.inject(AuthService);
    const httpMock2 = TestBed.inject(HttpTestingController);

    fresh.logout().subscribe();
    httpMock2.expectOne('/api/auth/logout').flush({});

    expect(fresh.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('current_user')).toBeNull();
  });

  it('clearSession wipes state without HTTP', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'a@x.com', name: 'A', role: 'WORKER' }));
    TestBed.resetTestingModule();
    setupTestBed();
    const fresh = TestBed.inject(AuthService);

    fresh.clearSession();

    expect(fresh.isLoggedIn()).toBe(false);
    expect(sessionStorage.getItem('current_user')).toBeNull();
  });
});

describe('AuthService - restored from sessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('isManager and roleLabel reflect MANAGER role', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'm@x.com', name: 'Manager M', role: 'MANAGER' }));
    setupTestBed();
    const svc = TestBed.inject(AuthService);
    expect(svc.isManager()).toBe(true);
    expect(svc.isWorker()).toBe(false);
    expect(svc.roleLabel()).toBe('Manager');
  });

  it('isWorker reflects WORKER role', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'w@x.com', name: 'Worker W', role: 'WORKER' }));
    setupTestBed();
    const svc = TestBed.inject(AuthService);
    expect(svc.isWorker()).toBe(true);
    expect(svc.roleLabel()).toBe('Worker');
  });

  it('initials returns two letters for two-word name', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'a@x.com', name: 'Alice Smith', role: 'WORKER' }));
    setupTestBed();
    expect(TestBed.inject(AuthService).initials()).toBe('AS');
  });

  it('initials returns one letter for single-word name', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'a@x.com', name: 'Alice', role: 'WORKER' }));
    setupTestBed();
    expect(TestBed.inject(AuthService).initials()).toBe('A');
  });

  it('fullName reflects current user', () => {
    sessionStorage.setItem('current_user', JSON.stringify({ id: 'u', email: 'a@x.com', name: 'Alice Smith', role: 'WORKER' }));
    setupTestBed();
    expect(TestBed.inject(AuthService).fullName()).toBe('Alice Smith');
  });
});
