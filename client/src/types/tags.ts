// Tags API Types

import { TPagination, TTodo } from "./todos";

// Common types
export interface TTag {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    todo_count?: string;
    todos?: TTodo[];
}

// GET /tags
export interface TTagsListRequest {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: "name" | "createdAt" | "updatedAt";
    sort_order?: "ASC" | "DESC";
    include_todo_count?: boolean;
    autocomplete?: boolean;
}

export interface TTagsListResponse {
    success: true;
    tags: TTag[];
    pagination: TPagination;
    filters: {
        search: string | null;
        sort_by: string;
        sort_order: string;
        include_todo_count: string;
        autocomplete: string;
    };
}

export interface TTagsAutocompleteResponse {
    success: true;
    tags: {
        id: number;
        name: string;
    }[];
    total_items: number;
}

// POST /tags
export interface TTagsCreateRequest {
    name: string;
}

export interface TTagsCreateResponse {
    success: true;
    message: string;
    tag: TTag;
}

// GET /tags/:id
export interface TTagsGetRequest {
    include_todos?: boolean;
}

export interface TTagsGetResponse {
    success: true;
    tag: TTag;
}

// PUT /tags/:id
export interface TTagsUpdateRequest {
    name: string;
}

export interface TTagsUpdateResponse {
    success: true;
    message: string;
    tag: TTag;
}

// DELETE /tags/:id
export interface TTagsDeleteRequest {
    force?: boolean;
}

export interface TTagsDeleteResponse {
    success: true;
    message: string;
    removed_from_todos: number;
}
