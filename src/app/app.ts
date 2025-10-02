// src/app/app.ts

import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VERSION } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        CommonModule
    ],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected readonly title = signal('TechRadar');

    constructor(
        // AuthService für Template-Zugriff
        public authService: AuthService
    ) {}

    logout(event: Event): void {
        event.preventDefault();
        this.authService.logout();
    }

    protected getAngularVersion(): string {
        return VERSION.full;
    }
}