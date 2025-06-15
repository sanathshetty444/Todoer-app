// Categories API Types

import { TPagination, TTodo } from "./todos";

// Common types
export interface TCategory {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    todo_count?: string;
    todos?: TTodo[];
}

// GET /categories
export interface TCategoriesListRequest {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: "name" | "createdAt" | "updatedAt";
    sort_order?: "ASC" | "DESC";
    include_todo_count?: boolean;
}

export interface TCategoriesListResponse {
    success: true;
    categories: TCategory[];
    pagination: TPagination;
    filters: {
        search: string | null;
        sort_by: string;
        sort_order: string;
        include_todo_count: string;
    };
}

// POST /categories
export interface TCategoriesCreateRequest {
    name: string;
}

export interface TCategoriesCreateResponse {
    success: true;
    message: string;
    category: TCategory;
}

// GET /categories/:id
export interface TCategoriesGetRequest {
    include_todos?: boolean;
}

export interface TCategoriesGetResponse {
    success: true;
    category: TCategory;
}

// PUT /categories/:id
export interface TCategoriesUpdateRequest {
    name: string;
}

export interface TCategoriesUpdateResponse {
    success: true;
    message: string;
    category: TCategory;
}

// DELETE /categories/:id
export interface TCategoriesDeleteRequest {
    force?: boolean;
}

export interface TCategoriesDeleteResponse {
    success: true;
    message: string;
    uncategorized_todos: number;
}
