// Types index - Re-export all types
export * from "./auth";
export * from "./todos";
export * from "./categories";
export * from "./tags";
export * from "./subtasks";

// Common API response types
export interface TApiError {
    success: false;
    error: string;
    message: string;
}

export interface THealthCheckResponse {
    success: true;
    message: string;
    timestamp: string;
    uptime: number;
}
