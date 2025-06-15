// Auth API Types

// Common types
export interface TUser {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

// POST /auth/register
export interface TAuthRegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface TAuthRegisterResponse {
    success: true;
    message: string;
    user: TUser;
    accessToken: string;
}

// POST /auth/login
export interface TAuthLoginRequest {
    email: string;
    password: string;
}

export interface TAuthLoginResponse {
    success: true;
    message: string;
    user: TUser;
    accessToken: string;
}

// POST /auth/logout
export interface TAuthLogoutRequest {
    refreshToken?: string;
}

export interface TAuthLogoutResponse {
    success: true;
    message: string;
}

// GET /auth/me
export interface TAuthMeRequest {}

export interface TAuthMeResponse {
    success: true;
    user: TUser;
}

// PUT /auth/me
export interface TAuthMeUpdateRequest {
    name?: string;
    email?: string;
}

export interface TAuthMeUpdateResponse {
    success: true;
    message: string;
    user: TUser;
}

// GET /auth/access-token
export interface TAuthAccessTokenRequest {}

export interface TAuthAccessTokenResponse {
    success: true;
    accessToken: string;
    message: string;
}

// POST /auth/refresh
export interface TAuthRefreshRequest {
    refreshToken: string;
}

export interface TAuthRefreshResponse {
    success: true;
    accessToken: string;
    message: string;
}
