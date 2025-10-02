// src/app/features/unauthorized/unauthorized.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { UnauthorizedComponent } from './unauthorized';

describe('Unauthorized', () => {
    let component: UnauthorizedComponent;
    let fixture: ComponentFixture<UnauthorizedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UnauthorizedComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]) // Leere Routes für Tests
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(UnauthorizedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});