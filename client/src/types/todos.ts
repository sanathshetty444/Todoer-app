// Todo API Types

// Common types
interface TCategory {
    id: number;
    name: string;
}

interface TTag {
    id: number;
    name: string;
}

interface TSubtask {
    id: number;
    title: string;
    completed: boolean;
    sequence?: number;
    status?: TODO_STATUS;
}

export enum TODO_STATUS {
    ALL = "ALL",
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ON_HOLD = "on_hold",
}
export interface TTodo {
    id: number;
    title: string;
    description: string | null;
    status: TODO_STATUS;
    completed: boolean;
    favorite: boolean;
    sequence: number;
    user_id: number;
    category_id: number | null;
    createdAt: string;
    updatedAt: string;
    category?: TCategory;
    tags?: TTag[];
    subtasks?: TSubtask[];
}

export interface TPagination {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
}

// GET /todos
export interface TTodosListRequest {
    page?: number;
    limit?: number;
    completed?: boolean;
    status?: TODO_STATUS | string;
    favorite?: boolean;
    category_id?: number;
    search?: string;
    sort_by?: "sequence" | "title" | "created_at" | "updated_at" | "completed";
    sort_order?: "ASC" | "DESC";
}

export interface TTodosListResponse {
    success: true;
    todos: TTodo[];
    pagination: TPagination;
    filters: {
        completed: boolean | null;
        favorite: boolean | null;
        category_id: number | null;
        search: string | null;
        sort_by: string;
        sort_order: string;
    };
}

// POST /todos
export interface TTodosCreateRequest {
    title: string;
    description?: string;
    category_id?: number;
    favorite?: boolean;
    tag_ids?: number[];
}

export interface TTodosCreateResponse {
    success: true;
    message: string;
    todo: TTodo;
}

// PUT /todos/reorder
export interface TTodosReorderRequest {
    todo_orders: {
        id: number;
        sequence: number;
    }[];
}

export interface TTodosReorderResponse {
    success: true;
    message: string;
    updated_count: number;
}

// GET /todos/:id
export interface TTodosGetRequest {}

export interface TTodosGetResponse {
    success: true;
    todo: TTodo;
}

// PUT /todos/:id
export interface TTodosUpdateRequest {
    title?: string;
    description?: string;
    category_id?: number | null;
    favorite?: boolean;
    completed?: boolean;
    tag_ids?: number[];
}

export interface TTodosUpdateResponse {
    success: true;
    message: string;
    todo: TTodo;
}

// DELETE /todos/:id
export interface TTodosDeleteRequest {}

export interface TTodosDeleteResponse {
    success: true;
    message: string;
}

// PUT /todos/:id/status
export interface TTodosStatusUpdateRequest {
    type: "completed" | "favorite" | "started";
    value?: boolean;
}

export interface TTodosStatusUpdateResponse {
    success: true;
    message: string;
    todo: {
        id: number;
        [key: string]: any;
    };
}
