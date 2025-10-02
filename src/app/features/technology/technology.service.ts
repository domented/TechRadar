// src/app/features/technology/technology.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Technology, CreateTechnologyDto, UpdateTechnologyDto, TechnologyCategory, TechnologyRing, TechnologyStatus } from '../../shared/models/technology.model';

@Injectable({
    providedIn: 'root'
})
export class TechnologyService {

    private readonly apiUrl = '/api/technologies'; // Base URL für alle Technology-Endpoints

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) {}

    createTechnology(technology: CreateTechnologyDto): Observable<Technology> {
        return this.http.post<any>(this.apiUrl, technology, this.httpOptions)
            .pipe(
                map(response => {
                    // Behandle Backend-Response-Struktur
                    if (response && response.success && response.data) {
                        return response.data;
                    }
                    return response;
                }),
                catchError(this.handleError<Technology>('createTechnology'))
            );
    }

    getTechnologies(status?: TechnologyStatus): Observable<Technology[]> {
        const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;

        return this.http.get<any>(url)
            .pipe(
                map(response => {
                    // Debug-Log für besseres Verständnis während der Entwicklung
                    console.log('Backend response structure:', response);

                    // Extrahiere das technologies Array aus der verschachtelten Struktur
                    if (response && response.success && response.data && response.data.technologies) {
                        console.log('Extracted technologies array:', response.data.technologies);
                        return response.data.technologies;
                    }

                    // Fallback für unerwartete Response-Strukturen
                    console.warn('Unexpected response structure, returning empty array');
                    return [];
                }),
                catchError(this.handleError<Technology[]>('getTechnologies', []))
            );
    }

    getTechnology(id: string): Observable<Technology | undefined> {
        const url = `${this.apiUrl}/${id}`;

        return this.http.get<any>(url)
            .pipe(
                map(response => {
                    // Debug-Log für besseres Verständnis während der Entwicklung
                    console.log('getTechnology Backend response structure:', response);
                    console.log('Response type:', typeof response);
                    console.log('Response keys:', Object.keys(response || {}));

                    // Hauptstrategie: Backend liefert { success: true, data: Technology }
                    if (response && response.success === true && response.data) {
                        console.log('Found technology in response.data:', response.data);

                        // Prüfen ob data ein Objekt mit id ist (das ist die Technologie)
                        if (response.data.id || response.data._id) {
                            return response.data;
                        }

                        // Fallback: Vielleicht ist es in data.technology verschachtelt
                        if (response.data.technology) {
                            console.log('Found technology in response.data.technology:', response.data.technology);
                            return response.data.technology;
                        }
                    }

                    // Fallback: Direktes Technology-Objekt
                    if (response && (response.id || response._id)) {
                        console.log('Technology returned directly:', response);
                        return response;
                    }

                    // Fehlerfall: Unerwartete Struktur
                    console.error('Unexpected response structure:', response);
                    console.error('Could not extract technology from response');
                    return undefined;
                }),
                catchError(error => {
                    console.error('getTechnology HTTP error:', error);
                    // Spezifische Behandlung für 200-OK-Fehler
                    if (error.status === 200) {
                        console.error('Status 200 but parsing failed - response body:', error.error);
                    }
                    return of(undefined);
                })
            );
    }

    updateTechnology(id: string, updateData: UpdateTechnologyDto): Observable<Technology> {
        const url = `${this.apiUrl}/${id}`;

        return this.http.put<any>(url, updateData, this.httpOptions)
            .pipe(
                map(response => {
                    console.log('updateTechnology Backend response:', response);

                    // Verwenden Sie dasselbe Response-Parsing wie bei getTechnology
                    if (response && response.success && response.data) {
                        console.log('Update successful, extracted data:', response.data);
                        return response.data;
                    }

                    // Fallback für direktes Technologie-Objekt
                    if (response && response.id) {
                        console.log('Update returned direct technology:', response);
                        return response;
                    }

                    console.warn('Unexpected update response structure:', response);
                    return response;
                }),
                catchError(this.handleError<Technology>('updateTechnology'))
            );
    }

    publishTechnology(id: string, ring: TechnologyRing, ringDescription: string): Observable<Technology> {
        const url = `${this.apiUrl}/${id}/publish`;
        const payload = { ring, ringDescription };

        return this.http.patch<any>(url, payload, this.httpOptions)
            .pipe(
                map(response => {
                    // Konsistente Response-Behandlung
                    if (response && response.success && response.data) {
                        return response.data;
                    }
                    return response;
                }),
                catchError(this.handleError<Technology>('publishTechnology'))
            );
    }

    deleteTechnology(id: string): Observable<boolean> {
        const url = `${this.apiUrl}/${id}`;

        return this.http.delete<any>(url, this.httpOptions)
            .pipe(
                map(response => {
                    // Debug-Log für besseres Verständnis während der Entwicklung
                    console.log('deleteTechnology Backend response:', response);

                    // Hauptstrategie: Backend liefert { success: true, data: {...}, message: "..." }
                    if (response && response.success === true) {
                        console.log('Technology successfully deleted:', response.message || 'No message');
                        return true;
                    }

                    // Fallback: Leere Response oder andere Erfolgsindikator
                    if (!response || Object.keys(response).length === 0) {
                        console.log('Delete operation completed (empty response)');
                        return true;
                    }

                    // Unerwartete Response-Struktur
                    console.warn('Unexpected delete response structure:', response);
                    return false;
                }),
                catchError(error => {
                    console.error('Delete technology HTTP error:', error);

                    // Spezifische Fehlerbehandlung für verschiedene HTTP-Status-Codes
                    if (error.status === 404) {
                        console.error('Technology not found for deletion');
                    } else if (error.status === 400) {
                        console.error('Cannot delete published technology or invalid request');
                    } else if (error.status === 403) {
                        console.error('Insufficient permissions to delete technology');
                    } else if (error.status === 500) {
                        console.error('Server error during deletion');
                    }

                    // Im Fehlerfall false zurückgeben - die Component wird entsprechend reagieren
                    return of(false);
                })
            );
    }

    getCategories(): { value: TechnologyCategory; label: string }[] {
        return Object.values(TechnologyCategory).map(category => ({
            value: category,
            label: category
        }));
    }

    getRings(): { value: TechnologyRing; label: string; description: string }[] {
        return [
            {
                value: TechnologyRing.ASSESS,
                label: 'Assess',
                description: 'Technologien, die es wert sind, verfolgt zu werden'
            },
            {
                value: TechnologyRing.TRIAL,
                label: 'Trial',
                description: 'Technologien, die in Pilotprojekten ausprobiert werden sollten'
            },
            {
                value: TechnologyRing.ADOPT,
                label: 'Adopt',
                description: 'Technologien, die wir für den Produktiveinsatz empfehlen'
            },
            {
                value: TechnologyRing.HOLD,
                label: 'Hold',
                description: 'Technologien, bei denen Vorsicht geboten ist'
            }
        ];
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed:`, error);

            // Rückgabe eines leeren Ergebnisses, damit die App weiterlaufen kann
            return of(result as T);
        };
    }
}