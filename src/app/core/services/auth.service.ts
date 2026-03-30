import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, UserSummary } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5210/api/auth';
  private readonly tokenStorageKey = 'vulpes.token';

  private readonly userSubject = new BehaviorSubject<UserSummary | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.refreshProfile();
    }
  }

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.applySession(response))
    );
  }

  register(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => this.applySession(response))
    );
  }

  me(): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${this.apiUrl}/me`);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserSummary | null {
    return this.userSubject.value;
  }

  isAdmin(): boolean {
    const role = this.userSubject.value?.role ?? this.getRoleFromToken();
    return role === 'admin';
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
    this.userSubject.next(null);
  }

  refreshProfile(): void {
    const token = this.getToken();
    if (!token) {
      this.userSubject.next(null);
      return;
    }

    this.me().subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => this.logout()
    });
  }

  private applySession(response: AuthResponse): void {
    localStorage.setItem(this.tokenStorageKey, response.token);
    this.userSubject.next(response.user);
  }

  private getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null;
    } catch {
      return null;
    }
  }
}
