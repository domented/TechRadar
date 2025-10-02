// src/app/features/technology/technology-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TechnologyService } from './technology.service';
import { Technology, CreateTechnologyDto, UpdateTechnologyDto, TechnologyCategory, TechnologyRing, TechnologyStatus } from '../../shared/models/technology.model';

@Component({
    selector: 'app-technology-form',
    standalone: true,
    imports: [
        CommonModule,        // Für *ngIf, *ngFor und andere grundlegende Direktiven
        ReactiveFormsModule  // Für [formGroup], formControlName und Reactive Forms
    ],
    templateUrl: './technology-form.component.html',
    styleUrls: ['./technology-form.component.css']
})
export class TechnologyFormComponent implements OnInit {

    technologyForm!: FormGroup;

    isLoading = false;                    // Zeigt Loading-Spinner während HTTP-Requests
    isSubmitting = false;                 // Verhindert Doppel-Submissions
    showSuccessMessage = false;           // Zeigt Erfolgsmeldung nach erfolgreichem Speichern
    errorMessage: string | null = null;   // Zeigt benutzerfreundliche Fehlermeldungen an

    isEditMode = false;                   // Steuert das Verhalten der gesamten Komponente
    currentTechnologyId: string | null = null;  // Speichert die ID für Update-Operationen
    originalTechnology: Technology | null = null;  // Speichert die ursprünglichen Daten

    categories: { value: TechnologyCategory; label: string }[] = [];
    rings: { value: TechnologyRing; label: string; description: string }[] = [];

    TechnologyStatus = TechnologyStatus;

    constructor(
        private formBuilder: FormBuilder,           // Service für Reactive Forms
        private technologyService: TechnologyService,  // Unser Custom Service für API-Calls
        private router: Router,                     // Navigation zwischen Routen
        private activatedRoute: ActivatedRoute      // Zugriff auf URL-Parameter für Edit-Mode
    ) {}

    ngOnInit(): void {
        console.log('TechnologyFormComponent ngOnInit aufgerufen');
        console.log('Route params:', this.activatedRoute.snapshot.params);
        console.log('Route URL:', this.router.url);

        this.initializeForm();
        this.loadDropdownData();

        // Der kritische Moment: Sind wir im Create- oder Edit-Modus?
        const id = this.activatedRoute.snapshot.params['id'];
        console.log('Extrahierte ID:', id);

        if (id) {
            console.log('Edit-Modus aktiviert für ID:', id);
            // Edit-Modus: Existierende Technologie laden und Formular vorausfüllen
            this.isEditMode = true;
            this.loadTechnologyForEdit(id);
        } else {
            console.log('Create-Modus - keine ID gefunden');
        }
    }

    private initializeForm(): void {
        this.technologyForm = this.formBuilder.group({
            name: ['', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(100)
            ]],
            category: ['', Validators.required],
            ring: [''],  // Optional für Entwürfe, Pflicht für Published
            description: ['', [
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(1000)
            ]],
            ringDescription: [''],  // Optional für Entwürfe, Pflicht für Published
            status: [TechnologyStatus.DRAFT, Validators.required]
        });

        this.technologyForm.get('status')?.valueChanges.subscribe(status => {
            this.updateValidationForStatus(status);
        });
    }

    private loadDropdownData(): void {
        this.categories = this.technologyService.getCategories();
        this.rings = this.technologyService.getRings();
    }

    private loadTechnologyForEdit(id: string): void {
        this.isLoading = true;
        this.currentTechnologyId = id;  // Wichtig: ID für spätere Update-Operation speichern

        this.technologyService.getTechnology(id).subscribe({
            next: (technology: Technology | undefined) => {
                if (technology) {
                    console.log('Technologie geladen:', technology);
                    this.originalTechnology = technology;  // Original-Daten speichern
                    this.populateForm(technology);
                } else {
                    this.handleLoadError('Technologie nicht gefunden');
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Fehler beim Laden der Technologie:', error);
                this.handleLoadError(error);
                this.isLoading = false;
            }
        });
    }

    private populateForm(technology: Technology): void {
        console.log('Formular wird befüllt mit:', technology);
        this.technologyForm.patchValue({
            name: technology.name,
            category: technology.category,
            ring: technology.ring,
            description: technology.description,
            ringDescription: technology.ringDescription,
            status: technology.status
        });
    }

    private handleLoadError(error: any): void {
        const errorMessage = typeof error === 'string' ? error : 'Die Technologie konnte nicht geladen werden. Bitte versuchen Sie es erneut.';
        this.errorMessage = errorMessage;
        console.error('Load error:', error);
    }

    private updateValidationForStatus(status: TechnologyStatus): void {
        const ringControl = this.technologyForm.get('ring');
        const ringDescriptionControl = this.technologyForm.get('ringDescription');

        if (status === TechnologyStatus.PUBLISHED) {
            // Business Rule: Publikierte Technologien müssen vollständig klassifiziert sein
            ringControl?.setValidators([Validators.required]);
            ringDescriptionControl?.setValidators([
                Validators.required,
                Validators.minLength(20),
                Validators.maxLength(2000)
            ]);
        } else {
            // Entwürfe dürfen unvollständig sein - das unterstützt iterative Bearbeitung
            ringControl?.clearValidators();
            ringDescriptionControl?.clearValidators();
        }

        // Wichtig: Validatoren müssen nach Änderung explizit aktualisiert werden
        ringControl?.updateValueAndValidity();
        ringDescriptionControl?.updateValueAndValidity();
    }

    onSubmit(): void {
        // Erste Verteidigung: Client-seitige Validierung
        if (this.technologyForm.invalid) {
            console.log('Formular ist ungültig:', this.technologyForm.errors);
            this.markFormGroupTouched(this.technologyForm);
            return;
        }

        // UI-Feedback: Dem Benutzer zeigen, dass etwas passiert
        this.isSubmitting = true;
        this.errorMessage = null;

        const technologyData = this.technologyForm.value;
        console.log('Formulardaten:', technologyData);

        if (this.isEditMode && this.currentTechnologyId) {
            console.log('Update-Pfad wird ausgeführt für ID:', this.currentTechnologyId);

            // Update-Pfad: Bestehende Technologie aktualisieren
            // Verwende die neue Service-Signatur: updateTechnology(id, updateData)
            const updateData: UpdateTechnologyDto = technologyData;

            console.log('Update-Daten:', updateData);

            this.technologyService.updateTechnology(this.currentTechnologyId, updateData).subscribe({
                next: (savedTechnology: Technology) => {
                    console.log('Update erfolgreich:', savedTechnology);
                    this.handleSuccessfulSave(savedTechnology, 'aktualisiert');
                },
                error: (error) => {
                    console.error('Update-Fehler:', error);
                    this.handleSaveError(error);
                }
            });
        } else {
            console.log('Create-Pfad wird ausgeführt');
            // Create-Pfad: Neue Technologie erstellen
            const createData: CreateTechnologyDto = technologyData;

            this.technologyService.createTechnology(createData).subscribe({
                next: (savedTechnology: Technology) => {
                    console.log('Erstellung erfolgreich:', savedTechnology);
                    this.handleSuccessfulSave(savedTechnology, 'erstellt');
                },
                error: (error) => {
                    console.error('Create-Fehler:', error);
                    this.handleSaveError(error);
                }
            });
        }
    }

    private handleSuccessfulSave(technology: Technology, action: string): void {
        this.isSubmitting = false;
        this.showSuccessMessage = true;

        // Benutzerfreundliche Erfolgsmeldung
        console.log(`Technologie erfolgreich ${action}:`, technology.name);

        // Erfolgsmeldung nach 3 Sekunden automatisch ausblenden
        setTimeout(() => {
            this.showSuccessMessage = false;
        }, 3000);

        // Kontextabhängiges Verhalten nach dem Speichern
        if (!this.isEditMode) {
            // Create-Modus: Formular für nächste Eingabe zurücksetzen
            this.technologyForm.reset();
            this.technologyForm.patchValue({
                status: TechnologyStatus.DRAFT
            });
        }
        // Edit-Modus: Formular bleibt gefüllt für weitere Bearbeitungen
        // Das ist benutzerfreundlicher, da weitere Änderungen möglich sind
    }

    private handleSaveError(error: any): void {
        this.isSubmitting = false;
        this.errorMessage = 'Beim Speichern ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.';
        console.error('Save error:', error);
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.technologyForm.get(fieldName);
        return field ? field.invalid && field.touched : false;
    }

    getFieldError(fieldName: string): string | null {
        const field = this.technologyForm.get(fieldName);

        if (field?.errors && field.touched) {
            if (field.errors['required']) return `${fieldName} ist ein Pflichtfeld.`;
            if (field.errors['minlength']) return `${fieldName} ist zu kurz.`;
            if (field.errors['maxlength']) return `${fieldName} ist zu lang.`;
        }

        return null;
    }

    onSaveAsDraft(): void {
        this.technologyForm.patchValue({ status: TechnologyStatus.DRAFT });
        this.onSubmit();
    }

    onSaveAndPublish(): void {
        this.technologyForm.patchValue({ status: TechnologyStatus.PUBLISHED });
        this.onSubmit();
    }

    onReset(): void {
        if (this.isEditMode && this.currentTechnologyId) {
            // Edit-Modus: Formular mit ursprünglichen Daten neu laden
            this.loadTechnologyForEdit(this.currentTechnologyId);
        } else {
            // Create-Modus: Leeres Formular
            this.technologyForm.reset();
            this.technologyForm.patchValue({ status: TechnologyStatus.DRAFT });
        }

        this.errorMessage = null;
        this.showSuccessMessage = false;
    }

    onCancel(): void {
        // Zurück zur Technologie-Liste
        this.router.navigate(['/technology/list']);
    }

    get formTitle(): string {
        return this.isEditMode ? 'Technologie bearbeiten' : 'Neue Technologie erfassen';
    }

    get submitButtonText(): string {
        if (this.isSubmitting) {
            return this.isEditMode ? 'Wird gespeichert...' : 'Wird erstellt...';
        }
        return this.isEditMode ? 'Änderungen speichern' : 'Technologie erstellen';
    }
}