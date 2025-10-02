// src/app/features/technology/technology-radar.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // HINZUGEFÜGT: Für ngModel
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TechnologyService } from './technology.service';
import { Technology, TechnologyStatus, TechnologyCategory, TechnologyRing } from '../../shared/models/technology.model';

interface RadarPoint {
    technology: Technology;
    x: number;
    y: number;
    quadrant: number;
    ring: number;
    angle: number;
    radius: number;
}

interface QuadrantInfo {
    name: string;
    category: TechnologyCategory;
    color: string;
    angle: number;
}

interface RingInfo {
    name: string;
    ring: TechnologyRing;
    radius: number;
    color: string;
}

@Component({
    selector: 'app-technology-radar',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule], // FormsModule hinzugefügt
    templateUrl: './technology-radar.component.html',
    styleUrls: ['./technology-radar.component.css']
})
export class TechnologyRadarComponent implements OnInit, OnDestroy {

    // Radar-Konfiguration
    private readonly RADAR_SIZE = 500;
    private readonly CENTER = this.RADAR_SIZE / 2;
    private readonly MAX_RADIUS = this.CENTER - 40;

    // Datenstrukturen
    technologies: Technology[] = [];
    publishedTechnologies: Technology[] = [];
    radarPoints: RadarPoint[] = [];

    // UI-Zustand
    isLoading = true;
    errorMessage: string | null = null;
    selectedTechnology: Technology | null = null;
    hoveredTechnology: Technology | null = null;

    // Filter-Zustand
    selectedQuadrant: TechnologyCategory | 'all' = 'all';
    selectedRing: TechnologyRing | 'all' = 'all';
    showDrafts = false;

    // Radar-Konfiguration
    quadrants: QuadrantInfo[] = [
        { name: 'Techniques', category: TechnologyCategory.TECHNIQUES, color: '#8B5A2B', angle: 0 },
        { name: 'Tools', category: TechnologyCategory.TOOLS, color: '#228B22', angle: 90 },
        { name: 'Platforms', category: TechnologyCategory.PLATFORMS, color: '#4169E1', angle: 180 },
        { name: 'Languages & Frameworks', category: TechnologyCategory.LANGUAGES_FRAMEWORKS, color: '#DC143C', angle: 270 }
    ];

    rings: RingInfo[] = [
        { name: 'Adopt', ring: TechnologyRing.ADOPT, radius: 0.25, color: '#28a745' },
        { name: 'Trial', ring: TechnologyRing.TRIAL, radius: 0.5, color: '#17a2b8' },
        { name: 'Assess', ring: TechnologyRing.ASSESS, radius: 0.75, color: '#ffc107' },
        { name: 'Hold', ring: TechnologyRing.HOLD, radius: 1.0, color: '#dc3545' }
    ];

    // Enum-Referenzen für Template
    TechnologyCategory = TechnologyCategory;
    TechnologyRing = TechnologyRing;
    TechnologyStatus = TechnologyStatus;

    private destroy$ = new Subject<void>();

    constructor(private technologyService: TechnologyService) {}

    ngOnInit(): void {
        this.loadTechnologies();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    trackByTechnology(index: number, point: RadarPoint): string {
        return point.technology.id || index.toString();
    }

    getPointColor(point: RadarPoint): string {
        const quadrant = this.quadrants.find(q => q.category === point.technology.category);
        return quadrant?.color || '#6c757d';
    }

    getPointStrokeColor(point: RadarPoint): string {
        if (point.technology.status === TechnologyStatus.DRAFT) {
            return '#dc3545';
        }
        return '#ffffff';
    }

    formatDate(date: Date | string | undefined): string {
        if (!date) return 'Unbekannt';
        const d = new Date(date);
        return d.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getQuadrantCount(quadrantName: string): number {
        const stats = this.getRadarStats();
        const quadrant = stats.byQuadrant.find(q => q.name === quadrantName);
        return quadrant?.count || 0;
    }

    getRingCount(ringName: string): number {
        const stats = this.getRadarStats();
        const ring = stats.byRing.find(r => r.name === ringName);
        return ring?.count || 0;
    }

    getQuadrantColor(category: TechnologyCategory): string {
        const quadrant = this.quadrants.find(q => q.category === category);
        return quadrant?.color || '#6c757d';
    }

    getRingColor(ring: TechnologyRing): string {
        const ringInfo = this.rings.find(r => r.ring === ring);
        return ringInfo?.color || '#6c757d';
    }

    loadTechnologies(): void {
        this.isLoading = true;
        this.errorMessage = null;

        this.technologyService.getTechnologies()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (technologies) => {
                    this.technologies = technologies;
                    this.prepareRadarData();
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading technologies:', error);
                    this.errorMessage = 'Fehler beim Laden der Technologien für das Radar.';
                    this.isLoading = false;
                }
            });
    }

    private prepareRadarData(): void {
        // Filtere Technologien basierend auf Anzeigeeinstellungen
        let technologiesToShow = this.technologies;

        if (!this.showDrafts) {
            technologiesToShow = technologiesToShow.filter(t => t.status === TechnologyStatus.PUBLISHED);
        }

        this.publishedTechnologies = technologiesToShow.filter(t =>
            t.status === TechnologyStatus.PUBLISHED && t.ring && t.category
        );

        // Berechne Positionen für jede Technologie
        this.radarPoints = this.calculateRadarPoints(this.publishedTechnologies);
    }

    private calculateRadarPoints(technologies: Technology[]): RadarPoint[] {
        const points: RadarPoint[] = [];

        // Gruppiere Technologien nach Quadrant und Ring
        const groups = this.groupTechnologies(technologies);

        Object.keys(groups).forEach(key => {
            const [quadrantIndex, ringIndex] = key.split('-').map(Number);
            const techs = groups[key];

            techs.forEach((tech, index) => {
                const point = this.calculatePointPosition(tech, quadrantIndex, ringIndex, index, techs.length);
                points.push(point);
            });
        });

        return points;
    }

    private groupTechnologies(technologies: Technology[]): { [key: string]: Technology[] } {
        const groups: { [key: string]: Technology[] } = {};

        technologies.forEach(tech => {
            const quadrantIndex = this.quadrants.findIndex(q => q.category === tech.category);
            const ringIndex = this.rings.findIndex(r => r.ring === tech.ring);

            if (quadrantIndex >= 0 && ringIndex >= 0) {
                const key = `${quadrantIndex}-${ringIndex}`;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(tech);
            }
        });

        return groups;
    }

    private calculatePointPosition(
        technology: Technology,
        quadrantIndex: number,
        ringIndex: number,
        itemIndex: number,
        totalItems: number
    ): RadarPoint {
        const quadrant = this.quadrants[quadrantIndex];
        const ring = this.rings[ringIndex];

        // Berechne den Winkel innerhalb des Quadranten
        const quadrantAngleStart = (quadrant.angle - 45) * Math.PI / 180;
        const quadrantAngleEnd = (quadrant.angle + 45) * Math.PI / 180;

        // Verteile Technologien gleichmäßig im Quadranten
        const angleStep = (quadrantAngleEnd - quadrantAngleStart) / (totalItems + 1);
        const angle = quadrantAngleStart + angleStep * (itemIndex + 1);

        // Berechne Radius mit etwas Variation innerhalb des Rings
        const ringRadiusMin = ringIndex === 0 ? 0 : this.rings[ringIndex - 1].radius * this.MAX_RADIUS;
        const ringRadiusMax = ring.radius * this.MAX_RADIUS;
        const radiusVariation = (ringRadiusMax - ringRadiusMin) * 0.3;
        const radius = ringRadiusMin + radiusVariation + Math.random() * radiusVariation;

        // Konvertiere Polarkoordinaten zu Kartesischen Koordinaten
        const x = this.CENTER + radius * Math.cos(angle);
        const y = this.CENTER + radius * Math.sin(angle);

        return {
            technology,
            x,
            y,
            quadrant: quadrantIndex,
            ring: ringIndex,
            angle: angle * 180 / Math.PI,
            radius
        };
    }

    onTechnologyHover(technology: Technology | null): void {
        this.hoveredTechnology = technology;
    }

    onTechnologyClick(technology: Technology): void {
        this.selectedTechnology = technology;
    }

    closeDetails(): void {
        this.selectedTechnology = null;
    }

    onQuadrantFilter(category: TechnologyCategory | 'all'): void {
        this.selectedQuadrant = category;
        this.applyFilters();
    }

    onRingFilter(ring: TechnologyRing | 'all'): void {
        this.selectedRing = ring;
        this.applyFilters();
    }

    onShowDraftsChange(showDrafts: boolean): void {
        this.showDrafts = showDrafts;
        this.prepareRadarData();
    }

    private applyFilters(): void {
        // Implementierung für Live-Filterung
        this.prepareRadarData();
    }

    getRadarSize(): number {
        return this.RADAR_SIZE;
    }

    getCenter(): number {
        return this.CENTER;
    }

    getRingRadius(ringIndex: number): number {
        return this.rings[ringIndex].radius * this.MAX_RADIUS;
    }

    getQuadrantPath(quadrantIndex: number): string {
        const quadrant = this.quadrants[quadrantIndex];
        const startAngle = (quadrant.angle - 45) * Math.PI / 180;
        const endAngle = (quadrant.angle + 45) * Math.PI / 180;

        const x1 = this.CENTER + this.MAX_RADIUS * Math.cos(startAngle);
        const y1 = this.CENTER + this.MAX_RADIUS * Math.sin(startAngle);
        const x2 = this.CENTER + this.MAX_RADIUS * Math.cos(endAngle);
        const y2 = this.CENTER + this.MAX_RADIUS * Math.sin(endAngle);

        return `M ${this.CENTER} ${this.CENTER} L ${x1} ${y1} A ${this.MAX_RADIUS} ${this.MAX_RADIUS} 0 0 1 ${x2} ${y2} Z`;
    }

    getQuadrantLabelPosition(quadrantIndex: number): { x: number, y: number } {
        const quadrant = this.quadrants[quadrantIndex];
        const angle = quadrant.angle * Math.PI / 180;
        const labelRadius = this.MAX_RADIUS * 0.85;

        return {
            x: this.CENTER + labelRadius * Math.cos(angle),
            y: this.CENTER + labelRadius * Math.sin(angle)
        };
    }

    getRingLabelPosition(ringIndex: number): { x: number, y: number } {
        const ring = this.rings[ringIndex];
        const radius = ring.radius * this.MAX_RADIUS;

        return {
            x: this.CENTER + radius - 10,
            y: this.CENTER - 5
        };
    }

    shouldShowTechnology(point: RadarPoint): boolean {
        const tech = point.technology;

        if (this.selectedQuadrant !== 'all' && tech.category !== this.selectedQuadrant) {
            return false;
        }

        if (this.selectedRing !== 'all' && tech.ring !== this.selectedRing) {
            return false;
        }

        return true;
    }

    getRadarStats() {
        const visible = this.radarPoints.filter(p => this.shouldShowTechnology(p));

        return {
            total: this.publishedTechnologies.length,
            visible: visible.length,
            byRing: this.rings.map(ring => ({
                name: ring.name,
                count: visible.filter(p => p.technology.ring === ring.ring).length,
                color: ring.color
            })),
            byQuadrant: this.quadrants.map(quadrant => ({
                name: quadrant.name,
                count: visible.filter(p => p.technology.category === quadrant.category).length,
                color: quadrant.color
            }))
        };
    }

    exportRadar(): void {
        const svgElement = document.querySelector('#technology-radar-svg') as SVGElement;
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `technology-radar-${new Date().toISOString().split('T')[0]}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
        }
    }
}