// src/app/shared/models/user.model.ts

export type UserRole = 'admin' | 'viewer';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    displayName?: string;
    tenantId: string;
    lastLogin?: Date;
    createdAt?: Date;
}

export interface LoginRequest {
    username: string;
    password: string;
    tenantId?: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        token: string;
        user: User;
        expiresIn: string;
    };
    message?: string;
    timestamp: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
}