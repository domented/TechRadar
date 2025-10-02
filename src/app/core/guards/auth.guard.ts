// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();

    console.log('authGuard - currentUser:', currentUser);
    console.log('authGuard - token:', token);
    console.log('authGuard - isAuthenticated:', authService.isAuthenticated());

    if (currentUser && token) {
        console.log('authGuard - Zugriff erlaubt');
        return true;
    }

    console.warn('authGuard - Zugriff verweigert');
    router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
    });
    return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.getCurrentUser();
    const token = authService.getToken();

    console.log('adminGuard - currentUser:', currentUser);
    console.log('adminGuard - token:', token);
    console.log('adminGuard - role:', currentUser?.role);

    if (!currentUser || !token) {
        console.warn('adminGuard - nicht authentifiziert');
        router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
        });
        return false;
    }

    if (currentUser.role === 'admin') {
        console.log('adminGuard - Admin-Zugriff erlaubt');
        return true;
    }

    console.warn('adminGuard - keine Admin-Berechtigung');
    router.navigate(['/unauthorized']);
    return false;
};

export const loginGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        router.navigate(['/technology/radar']);
        return false;
    }

    return true;
};