// Subtasks API Types

import { TPagination, TTodo } from "./todos";

// Common types
export interface TSubtask {
    id: number;
    title: string;
    status: "not_started" | "in_progress" | "on_hold" | "completed";
    completed: boolean;
    sequence: number;
    todo_id: number;
    createdAt: string;
    updatedAt: string;
    todo?: TTodo;
}

// GET /subtasks
export interface TSubtasksListRequest {
    todo_id: number;
    status?: "not_started" | "in_progress" | "on_hold" | "completed";
    completed?: boolean;
    include_todo?: boolean;
    page?: number;
    limit?: number;
    sort_by?: "sequence" | "title" | "status" | "createdAt" | "updatedAt";
    sort_order?: "ASC" | "DESC";
}

export interface TSubtasksListResponse {
    success: true;
    subtasks: TSubtask[];
    pagination: TPagination;
    filters: {
        todo_id: number;
        status: string | null;
        completed: boolean | null;
        include_todo: string;
        sort_by: string;
        sort_order: string;
    };
}

// POST /subtasks
export interface TSubtasksCreateRequest {
    title: string;
    todo_id: number;
    status?: "not_started" | "in_progress" | "on_hold" | "completed";
    completed?: boolean;
}

export interface TSubtasksCreateResponse {
    success: true;
    message: string;
    subtask: TSubtask;
}

// PUT /subtasks/reorder
export interface TSubtasksReorderRequest {
    todo_id: number;
    subtasks: {
        id: number;
        sequence: number;
    }[];
}

export interface TSubtasksReorderResponse {
    success: true;
    message: string;
    subtasks: TSubtask[];
}

// GET /subtasks/:id
export interface TSubtasksGetRequest {
    include_todo?: boolean;
}

export interface TSubtasksGetResponse {
    success: true;
    subtask: TSubtask;
}

// PUT /subtasks/:id
export interface TSubtasksUpdateRequest {
    title?: string;
    status?: "not_started" | "in_progress" | "on_hold" | "completed";
    completed?: boolean;
}

export interface TSubtasksUpdateResponse {
    success: true;
    message: string;
    subtask: TSubtask;
}

// DELETE /subtasks/:id
export interface TSubtasksDeleteRequest {}

export interface TSubtasksDeleteResponse {
    success: true;
    message: string;
}

// PUT /subtasks/:id/status
export interface TSubtasksStatusUpdateRequest {
    status: "not_started" | "in_progress" | "on_hold" | "completed";
}

export interface TSubtasksStatusUpdateResponse {
    success: true;
    message: string;
    subtask: TSubtask;
}
