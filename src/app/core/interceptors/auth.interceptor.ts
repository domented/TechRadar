// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Token abrufen
    const token = authService.getToken();

    // wenn vorhanden
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Request weiterleiten und Fehler behandeln
    return next(req).pipe(
        catchError((error) => {
            // Bei 401 Unauthorized: Logout und Redirect zu Login
            if (error.status === 401) {
                console.warn('401 Unauthorized - Token ungültig oder abgelaufen');
                authService.logout();
                router.navigate(['/login']);
            }

            // 403 Forbidden
            if (error.status === 403) {
                console.error('403 Forbidden - Keine Berechtigung für diese Aktion');
            }

            return throwError(() => error);
        })
    );
};