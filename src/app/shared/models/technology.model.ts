// src/app/shared/models/technology.model.ts

export enum TechnologyCategory {
    TECHNIQUES = 'Techniques',
    TOOLS = 'Tools',
    PLATFORMS = 'Platforms',
    LANGUAGES_FRAMEWORKS = 'Languages & Frameworks'
}

export enum TechnologyRing {
    ASSESS = 'Assess',
    TRIAL = 'Trial',
    ADOPT = 'Adopt',
    HOLD = 'Hold'
}

export enum TechnologyStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published'
}

export interface Technology {
    id?: string;
    name: string;
    category: TechnologyCategory;
    ring?: TechnologyRing;
    description: string;
    ringDescription?: string;
    status: TechnologyStatus;
    createdAt?: Date;
    updatedAt?: Date;
    publishedAt?: Date;
}

export interface UpdateTechnologyDto {
    name?: string;
    category?: TechnologyCategory;
    ring?: TechnologyRing;
    description?: string;
    ringDescription?: string;
    status?: TechnologyStatus;
}

export interface CreateTechnologyDto {
    name: string;
    category: TechnologyCategory;
    ring?: TechnologyRing;
    description: string;
    ringDescription?: string;
    status: TechnologyStatus;
}