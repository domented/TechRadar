// src/app/features/unauthorized/unauthorized.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './unauthorized.html',
    styleUrls: ['./unauthorized.css']
})
export class UnauthorizedComponent {
    constructor(
        public authService: AuthService,
        private router: Router
    ) {}

    goBack(): void {
        this.router.navigate(['/technology/radar']);
    }
}