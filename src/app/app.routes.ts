import { Routes } from '@angular/router';
import { authGuard, adminGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login.component')
                .then(c => c.LoginComponent),
        canActivate: [loginGuard],
        title: 'Anmelden'
    },
    {
        path: 'unauthorized',
        loadComponent: () =>
            import('./features/unauthorized/unauthorized')
                .then(c => c.UnauthorizedComponent),
        title: 'Zugriff verweigert'
    },
    {
        path: '',
        redirectTo: '/technology/radar',
        pathMatch: 'full'
    },
    {
        path: 'technology/radar',
        loadComponent: () =>
            import('./features/technology/technology-radar.component')
                .then(c => c.TechnologyRadarComponent),
        canActivate: [authGuard],
        title: 'Technology Radar Visualisierung'
    },
    {
        path: 'technology/list',
        loadComponent: () =>
            import('./features/technology/technology-list.component')
                .then(c => c.TechnologyListComponent),
        canActivate: [authGuard],
        title: 'Technologie-Übersicht'
    },
    {
        path: 'technology/new',
        loadComponent: () =>
            import('./features/technology/technology-form.component')
                .then(c => c.TechnologyFormComponent),
        canActivate: [authGuard, adminGuard],
        title: 'Neue Technologie erfassen'
    },
    {
        path: 'technology/edit/:id',
        loadComponent: () =>
            import('./features/technology/technology-form.component')
                .then(c => c.TechnologyFormComponent),
        canActivate: [authGuard, adminGuard],
        title: 'Technologie bearbeiten'
    },
    {
        path: 'audit-logs',
        loadComponent: () =>
            import('./features/audit/audit-log-list.component')
                .then(c => c.AuditLogListComponent),
        canActivate: [authGuard, adminGuard],
        title: 'Audit Logs'
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];