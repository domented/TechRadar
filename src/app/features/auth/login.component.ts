// src/app/features/auth/login.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;

    // Reactive State mit Signals
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    // Return URL für Redirect nach Login
    private returnUrl: string;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        // Form initialisieren
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });

        // Return URL aus Query Params lesen
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/technology/radar';
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.errorMessage.set('Bitte füllen Sie alle Felder korrekt aus');
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const credentials = this.loginForm.value;

        this.authService.login(credentials).subscribe({
            next: (response) => {
                console.log('Login erfolgreich');
                this.isLoading.set(false);

                setTimeout(() => {
                    this.router.navigate([this.returnUrl]);
                }, 100);
            },
            error: (error) => {
                console.error('Login fehlgeschlagen:', error);
                this.isLoading.set(false);

                if (error.error?.message) {
                    this.errorMessage.set(error.error.message);
                } else if (error.status === 401) {
                    this.errorMessage.set('Ungültige Anmeldedaten');
                } else if (error.status === 423) {
                    this.errorMessage.set('Account ist gesperrt. Bitte versuchen Sie es später erneut.');
                } else {
                    this.errorMessage.set('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                }
            }
        });
    }

    get username() {
        return this.loginForm.get('username');
    }

    get password() {
        return this.loginForm.get('password');
    }
}