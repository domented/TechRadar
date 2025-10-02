// src/app/features/technology/technology-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import { TechnologyService } from './technology.service';
import { Technology, TechnologyStatus, TechnologyCategory, TechnologyRing } from '../../shared/models/technology.model';

@Component({
    selector: 'app-technology-list',
    standalone: true,
    imports: [
        CommonModule,    // Für *ngIf, *ngFor, Pipes etc.
        RouterModule,    // Für routerLink Navigation
        FormsModule      // Für [(ngModel)] Two-Way Data Binding
    ],
    templateUrl: './technology-list.component.html',
    styleUrls: ['./technology-list.component.css']
})
export class TechnologyListComponent implements OnInit, OnDestroy {

    technologies: Technology[] = [];

    filteredTechnologies: Technology[] = [];

    isLoading = true;                     // Zeigt Loading-Spinner während Datenladung
    isDeleting: { [key: string]: boolean } = {}; // Tracks deletion state per technology
    errorMessage: string | null = null;   // Zeigt Fehlermeldungen an
    successMessage: string | null = null; // Zeigt Erfolgsmeldungen an

    selectedStatus: TechnologyStatus | 'all' = 'all';
    selectedCategory: TechnologyCategory | 'all' = 'all';
    selectedRing: TechnologyRing | 'all' = 'all';
    searchQuery = '';
    sortField: keyof Technology = 'updatedAt';
    sortDirection: 'asc' | 'desc' = 'desc';

    TechnologyStatus = TechnologyStatus;
    TechnologyCategory = TechnologyCategory;
    TechnologyRing = TechnologyRing;

    private destroy$ = new Subject<void>();

    constructor(
        private technologyService: TechnologyService
    ) {}

    ngOnInit(): void {
        this.loadTechnologies();
        this.setupServiceSubscriptions();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadTechnologies(): void {
        this.isLoading = true;
        this.errorMessage = null;

        this.technologyService.getTechnologies()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (technologies) => {
                    this.technologies = technologies;
                    this.applyFiltersAndSorting();
                    this.isLoading = false;

                    // Erfolgsmeldung nur bei ersten Ladevorgang anzeigen
                    if (this.technologies.length === 0) {
                        this.successMessage = 'Noch keine Technologien erfasst. Erstellen Sie die erste Technologie!';
                    }
                },
                error: (error) => {
                    console.error('Error loading technologies:', error);
                    this.errorMessage = 'Fehler beim Laden der Technologien. Bitte versuchen Sie es erneut.';
                    this.isLoading = false;
                }
            });
    }

    private setupServiceSubscriptions(): void {
        // Hier könnten wir auf Service-Events reagieren, wenn der Service
        // Events für CRUD-Operationen emittieren würde
        // Für jetzt verwenden wir explizite Reload-Calls
    }

    applyFiltersAndSorting(): void {
        let filtered = [...this.technologies];

        // Status-Filter
        if (this.selectedStatus !== 'all') {
            filtered = filtered.filter(tech => tech.status === this.selectedStatus);
        }

        // Kategorie-Filter
        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(tech => tech.category === this.selectedCategory);
        }

        // Ring-Filter (nur für veröffentlichte Technologien)
        if (this.selectedRing !== 'all') {
            filtered = filtered.filter(tech => tech.ring === this.selectedRing);
        }

        // Text-Suche in Name und Beschreibung
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(tech =>
                tech.name.toLowerCase().includes(query) ||
                tech.description.toLowerCase().includes(query) ||
                (tech.ringDescription && tech.ringDescription.toLowerCase().includes(query))
            );
        }

        // Sortierung anwenden
        filtered.sort((a, b) => {
            const aValue = a[this.sortField];
            const bValue = b[this.sortField];

            let comparison = 0;

            if (aValue instanceof Date && bValue instanceof Date) {
                comparison = aValue.getTime() - bValue.getTime();
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else {
                comparison = String(aValue).localeCompare(String(bValue));
            }

            return this.sortDirection === 'desc' ? -comparison : comparison;
        });

        this.filteredTechnologies = filtered;
    }

    onStatusFilterChange(status: TechnologyStatus | 'all'): void {
        this.selectedStatus = status;
        this.applyFiltersAndSorting();
    }

    onCategoryFilterChange(category: TechnologyCategory | 'all'): void {
        this.selectedCategory = category;
        this.applyFiltersAndSorting();
    }

    onRingFilterChange(ring: TechnologyRing | 'all'): void {
        this.selectedRing = ring;
        this.applyFiltersAndSorting();
    }

    onSearchChange(query: string): void {
        this.searchQuery = query;
        this.applyFiltersAndSorting();
    }

    changeSorting(field: keyof Technology): void {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.applyFiltersAndSorting();
    }

    deleteTechnology(technology: Technology): void {
        // Defensive Programmierung: ID-Validierung
        if (!technology.id) {
            console.error('Cannot delete technology: Missing ID', technology);
            this.showError('Technologie-ID nicht gefunden. Bitte laden Sie die Seite neu.');
            return;
        }

        // Geschäftslogik-Validierung: Nur Entwürfe können gelöscht werden
        if (technology.status !== TechnologyStatus.DRAFT) {
            console.warn('Attempt to delete published technology blocked', technology);
            this.showError('Nur Entwürfe können gelöscht werden. Veröffentlichte Technologien sind schreibgeschützt.');
            return;
        }

        // Erweiterte Benutzerbestätigung mit Kontext
        const confirmMessage = [
            `Möchten Sie "${technology.name}" wirklich löschen?`,
            ``,
            `Kategorie: ${technology.category}`,
            `Status: ${technology.status === TechnologyStatus.DRAFT ? 'Entwurf' : 'Veröffentlicht'}`,
            ``,
            `Diese Aktion kann nicht rückgängig gemacht werden!`
        ].join('\n');

        if (!confirm(confirmMessage)) {
            console.log('User cancelled deletion of technology:', technology.name);
            return;
        }

        // Verhindern mehrfacher gleichzeitiger Löschvorgänge
        if (this.isDeleting[technology.id]) {
            console.log('Delete already in progress for technology:', technology.id);
            return;
        }

        // UI-Zustand setzen und Feedback vorbereiten
        this.isDeleting[technology.id] = true;
        this.clearMessages();

        console.log('Starting delete process for technology:', {
            id: technology.id,
            name: technology.name,
            status: technology.status
        });

        this.technologyService.deleteTechnology(technology.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (success) => {
                    console.log('Delete service response:', success);

                    if (success) {
                        // Optimistisches Update: Sofortige UI-Aktualisierung
                        const originalLength = this.technologies.length;
                        this.technologies = this.technologies.filter(t => t.id !== technology.id);

                        console.log(`Removed technology from local list. Count: ${originalLength} → ${this.technologies.length}`);

                        // Gefilterte Liste neu berechnen
                        this.applyFiltersAndSorting();

                        // Erfolgreiche Rückmeldung an Benutzer
                        this.showSuccess(`"${technology.name}" wurde erfolgreich gelöscht.`);

                        // Analytics/Logging für Produktionsumgebung
                        console.log('Technology deletion completed successfully:', {
                            deletedTechnology: technology.name,
                            remainingCount: this.technologies.length,
                            timestamp: new Date().toISOString()
                        });

                    } else {
                        // Service gab false zurück - Backend-Fehler
                        console.error('Delete service returned false');
                        this.showError(
                            'Das Löschen konnte nicht durchgeführt werden. ' +
                            'Möglicherweise wurde die Technologie bereits gelöscht oder ist nicht mehr verfügbar. ' +
                            'Bitte laden Sie die Liste neu.'
                        );
                    }
                },
                error: (error) => {
                    console.error('Delete operation failed with error:', error);

                    // Benutzerfreundliche Fehlermeldung basierend auf Fehlertyp
                    let errorMessage = 'Beim Löschen ist ein unerwarteter Fehler aufgetreten.';

                    if (error.status === 404) {
                        errorMessage = 'Die Technologie wurde nicht gefunden. Möglicherweise wurde sie bereits gelöscht.';
                    } else if (error.status === 400) {
                        errorMessage = 'Die Technologie kann nicht gelöscht werden. Nur Entwürfe sind löschbar.';
                    } else if (error.status === 403) {
                        errorMessage = 'Sie haben keine Berechtigung, diese Technologie zu löschen.';
                    } else if (error.status === 0) {
                        errorMessage = 'Keine Verbindung zum Server. Bitte überprüfen Sie Ihre Internetverbindung.';
                    } else if (error.status >= 500) {
                        errorMessage = 'Server-Fehler beim Löschen. Bitte versuchen Sie es später erneut.';
                    }

                    this.showError(errorMessage);

                    if (error.status === 404) {
                        setTimeout(() => {
                            if (confirm('Möchten Sie die Liste neu laden, um den aktuellen Stand zu sehen?')) {
                                this.loadTechnologies();
                            }
                        }, 3000);
                    }
                },
                complete: () => {
                    // Cleanup: Loading-Zustand immer zurücksetzen
                    if (technology.id && this.isDeleting[technology.id]) {
                        delete this.isDeleting[technology.id];
                        console.log('Cleanup completed for technology deletion:', technology.id);
                    }
                }
            });
    }

    publishTechnology(technology: Technology): void {
        // Sicherheitsprüfung für ID
        if (!technology.id) {
            this.showError('Technologie-ID nicht gefunden.');
            return;
        }

        if (technology.status === TechnologyStatus.PUBLISHED) {
            this.showError('Technologie ist bereits veröffentlicht.');
            return;
        }

        if (!technology.ring || !technology.ringDescription) {
            this.showError('Ring und Ring-Beschreibung sind für die Veröffentlichung erforderlich.');
            return;
        }

        this.isDeleting[technology.id] = true; // Wiederverwendung des Loading-States
        this.clearMessages();

        this.technologyService.publishTechnology(technology.id, technology.ring, technology.ringDescription)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedTechnology) => {
                    // Lokale Daten aktualisieren
                    const index = this.technologies.findIndex(t => t.id === technology.id);
                    if (index !== -1) {
                        this.technologies[index] = updatedTechnology;
                        this.applyFiltersAndSorting();
                    }

                    // Cleanup: Loading-State entfernen
                    if (technology.id) {
                        delete this.isDeleting[technology.id];
                    }
                    this.showSuccess(`"${technology.name}" wurde erfolgreich veröffentlicht.`);
                },
                error: (error) => {
                    console.error('Error publishing technology:', error);
                    if (technology.id) {
                        this.isDeleting[technology.id] = false;
                    }
                    this.showError('Fehler beim Veröffentlichen der Technologie.');
                }
            });
    }

    private showSuccess(message: string): void {
        this.successMessage = message;
        this.errorMessage = null;
        // Nachrichten nach 5 Sekunden automatisch ausblenden
        setTimeout(() => this.successMessage = null, 5000);
    }

    private showError(message: string): void {
        this.errorMessage = message;
        this.successMessage = null;
        // Fehlermeldungen länger anzeigen
        setTimeout(() => this.errorMessage = null, 7000);
    }

    private clearMessages(): void {
        this.successMessage = null;
        this.errorMessage = null;
    }

    getTechnologiesCount(): number {
        return this.filteredTechnologies.length;
    }

    getTotalTechnologiesCount(): number {
        return this.technologies.length;
    }

    getPublishedCount(): number {
        return this.technologies.filter(t => t.status === TechnologyStatus.PUBLISHED).length;
    }

    getDraftCount(): number {
        return this.technologies.filter(t => t.status === TechnologyStatus.DRAFT).length;
    }

    formatDate(date: Date | string | undefined): string {
        if (!date) return 'Unbekannt';

        try {
            const d = typeof date === 'string' ? new Date(date) : date;

            // Überprüfung auf gültiges Datum
            if (isNaN(d.getTime())) return 'Ungültiges Datum';

            return d.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.warn('Error formatting date:', date, error);
            return 'Formatierungsfehler';
        }
    }

    getStatusBadgeClass(status: TechnologyStatus): string {
        return status === TechnologyStatus.PUBLISHED ? 'badge-success' : 'badge-warning';
    }

    getRingBadgeClass(ring: TechnologyRing | undefined): string {
        if (!ring) return 'badge-secondary';

        switch (ring) {
            case TechnologyRing.ADOPT: return 'badge-success';
            case TechnologyRing.TRIAL: return 'badge-info';
            case TechnologyRing.ASSESS: return 'badge-warning';
            case TechnologyRing.HOLD: return 'badge-danger';
            default: return 'badge-secondary';
        }
    }

    trackByTechnologyId(index: number, technology: Technology): string {
        return technology.id || `temp_${index}`;
    }
}