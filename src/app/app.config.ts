// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        // Zone Change Detection mit Optimierung
        provideZoneChangeDetection({ eventCoalescing: true }),

        // Router mit definierten Routes
        provideRouter(routes),

        // HTTP Client mit Auth Interceptor
        provideHttpClient(
            withInterceptors([authInterceptor])
        )
    ]
};