// src/app/core/services/auth.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, LoginRequest, LoginResponse, AuthState } from '../../shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // API Base URL - in Production aus Environment
    private readonly API_URL = 'http://localhost:3000/api';

    // LocalStorage Keys
    private readonly TOKEN_KEY = 'techradar_token';
    private readonly USER_KEY = 'techradar_user';

    // Reactive State mit Signals
    private currentUserSignal = signal<User | null>(null);
    private tokenSignal = signal<string | null>(null);

    // Public Computed Signals für Template/Components
    public currentUser = this.currentUserSignal.asReadonly();
    public token = this.tokenSignal.asReadonly();

    public isAuthenticated = computed(() => {
        return this.currentUserSignal() !== null && this.tokenSignal() !== null;
    });

    public isAdmin = computed(() => {
        return this.currentUserSignal()?.role === 'admin';
    });

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Bei App-Start: Token und User aus LocalStorage laden
        this.loadAuthStateFromStorage();
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(
            `${this.API_URL}/auth/login`,
            credentials
        ).pipe(
            tap(response => {
                if (response.success && response.data) {
                    // Token und User speichern
                    this.setAuthState(response.data.token, response.data.user);

                    console.log('Login erfolgreich:', response.data.user.username);
                }
            }),
            catchError(error => {
                console.error('Login fehlgeschlagen:', error);
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        // Optional: Backend-Call für Logout-Logging
        if (this.isAuthenticated()) {
            this.http.post(`${this.API_URL}/auth/logout`, {})
                .subscribe({
                    next: () => console.log('Logout erfolgreich'),
                    error: (err) => console.warn('Logout-Call fehlgeschlagen:', err)
                });
        }

        // Auth-State löschen
        this.clearAuthState();

        // Zur Login-Seite navigieren
        this.router.navigate(['/login']);
    }

    verifyToken(): Observable<any> {
        return this.http.get(`${this.API_URL}/auth/verify`).pipe(
            tap(() => console.log('Token ist gültig')),
            catchError(error => {
                console.warn('Token ungültig oder abgelaufen');
                this.clearAuthState();
                return throwError(() => error);
            })
        );
    }

    getToken(): string | null {
        return this.tokenSignal();
    }

    getCurrentUser(): User | null {
        return this.currentUserSignal();
    }

    hasAdminRole(): boolean {
        return this.isAdmin();
    }

    private setAuthState(token: string, user: User): void {
        // In Signals speichern
        this.tokenSignal.set(token);
        this.currentUserSignal.set(user);

        // In LocalStorage persistieren
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    private clearAuthState(): void {
        // Signals zurücksetzen
        this.tokenSignal.set(null);
        this.currentUserSignal.set(null);

        // LocalStorage leeren
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    private loadAuthStateFromStorage(): void {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const userJson = localStorage.getItem(this.USER_KEY);

        if (token && userJson) {
            try {
                const user: User = JSON.parse(userJson);
                this.tokenSignal.set(token);
                this.currentUserSignal.set(user);

                console.log('Auth-State aus LocalStorage geladen:', user.username);

            } catch (error) {
                console.error('Fehler beim Laden des Auth-State:', error);
                this.clearAuthState();
            }
        }
    }
}