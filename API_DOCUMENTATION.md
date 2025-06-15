# Todo Management API Documentation

## Overview

This is a comprehensive REST API for a todo management system with authentication, built with Node.js, Express, TypeScript, and Sequelize. The API supports user authentication, todo management, categories, tags, and subtasks.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except authentication routes require a valid JWT access token. The API uses:

-   **Access Tokens**: Stored in client localStorage, sent in `Authorization: Bearer <token>` header
-   **Refresh Tokens**: Stored as httpOnly cookies, automatically sent with requests

## Common Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message",
    "message": "Detailed error description"
}
```

## Health Check

### GET /health

Check API health status.

**Response:**

```json
{
    "success": true,
    "message": "API is healthy",
    "timestamp": "2025-06-14T10:30:00.000Z",
    "uptime": 3600.123
}
```

---

# Authentication Routes (`/auth/*`)

## POST /auth/register

Register a new user account.

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
}
```

**Validation:**

-   All fields are required
-   Email must be valid format
-   Password must meet security requirements

**Response (201):**

```json
{
    "success": true,
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Set-Cookie:** `refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

## POST /auth/login

Authenticate user and get tokens.

**Request Body:**

```json
{
    "email": "john@example.com",
    "password": "SecurePassword123!"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## POST /auth/logout

Logout user and invalidate refresh token.

**Request:** Can include refresh token in body or relies on httpOnly cookie

**Response (200):**

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

## GET /auth/me

Get current user profile (requires authentication).

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{
    "success": true,
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## PUT /auth/me

Update user profile (requires authentication).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "name": "John Smith",
    "email": "johnsmith@example.com"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Profile updated successfully",
    "user": {
        "id": 1,
        "name": "John Smith",
        "email": "johnsmith@example.com",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## GET /auth/access-token

Get new access token using refresh token.

**Sources:** Refresh token from cookie, body, or `x-refresh-token` header

**Response (200):**

```json
{
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Access token refreshed successfully"
}
```

## POST /auth/refresh

Alternative endpoint for token refresh.

**Request Body:**

```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "Access token refreshed successfully"
}
```

---

# Todo Management Routes (`/todos/*`)

All todo routes require authentication.

## GET /todos

List user's todos with filters and pagination.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `page` (number, default: 1) - Page number
-   `limit` (number, default: 10, max: 100) - Items per page
-   `completed` (boolean) - Filter by completion status
-   `favorite` (boolean) - Filter by favorite status
-   `category_id` (number) - Filter by category
-   `search` (string) - Search in title and description
-   `sort_by` (string, default: "sequence") - Sort field: sequence, title, created_at, updated_at, completed
-   `sort_order` (string, default: "ASC") - Sort direction: ASC, DESC

**Response (200):**

```json
{
    "success": true,
    "todos": [
        {
            "id": 1,
            "title": "Complete project",
            "description": "Finish the todo app",
            "completed": false,
            "favorite": true,
            "sequence": 1,
            "user_id": 1,
            "category_id": 2,
            "createdAt": "2025-06-14T10:30:00.000Z",
            "updatedAt": "2025-06-14T10:30:00.000Z",
            "user": {
                "name": "John Doe",
                "email": "john@example.com"
            },
            "category": {
                "id": 2,
                "name": "Work"
            },
            "tags": [
                {
                    "id": 1,
                    "name": "urgent"
                }
            ],
            "subtasks": [
                {
                    "id": 1,
                    "title": "Setup project",
                    "completed": true
                }
            ]
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 5,
        "total_items": 45,
        "items_per_page": 10,
        "has_next": true,
        "has_prev": false
    },
    "filters": {
        "completed": null,
        "favorite": null,
        "category_id": null,
        "search": null,
        "sort_by": "sequence",
        "sort_order": "ASC"
    }
}
```

## POST /todos

Create a new todo.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "title": "New Todo",
    "description": "Todo description",
    "category_id": 1,
    "favorite": false,
    "tag_ids": [1, 2]
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "Todo created successfully",
    "todo": {
        "id": 2,
        "title": "New Todo",
        "description": "Todo description",
        "completed": false,
        "favorite": false,
        "sequence": 2,
        "user_id": 1,
        "category_id": 1,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z",
        "category": {
            "id": 1,
            "name": "Personal"
        },
        "tags": [
            {
                "id": 1,
                "name": "important"
            },
            {
                "id": 2,
                "name": "work"
            }
        ]
    }
}
```

## PUT /todos/reorder

Bulk reorder todos (drag-drop functionality).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "todo_orders": [
        { "id": 1, "sequence": 2 },
        { "id": 2, "sequence": 1 },
        { "id": 3, "sequence": 3 }
    ]
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Todos reordered successfully",
    "updated_count": 3
}
```

## GET /todos/:id

Get specific todo with relationships.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{
    "success": true,
    "todo": {
        "id": 1,
        "title": "Complete project",
        "description": "Finish the todo app",
        "completed": false,
        "favorite": true,
        "sequence": 1,
        "user_id": 1,
        "category_id": 2,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z",
        "category": {
            "id": 2,
            "name": "Work"
        },
        "tags": [
            {
                "id": 1,
                "name": "urgent"
            }
        ],
        "subtasks": [
            {
                "id": 1,
                "title": "Setup project",
                "completed": true,
                "sequence": 1
            }
        ]
    }
}
```

## PUT /todos/:id

Update todo (title, status, category, etc.).

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "title": "Updated Todo Title",
    "description": "Updated description",
    "category_id": 3,
    "favorite": true,
    "completed": false,
    "tag_ids": [1, 3]
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Todo updated successfully",
    "todo": {
        "id": 1,
        "title": "Updated Todo Title",
        "description": "Updated description",
        "completed": false,
        "favorite": true,
        "sequence": 1,
        "user_id": 1,
        "category_id": 3,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z",
        "category": {
            "id": 3,
            "name": "Personal"
        },
        "tags": [
            {
                "id": 1,
                "name": "urgent"
            },
            {
                "id": 3,
                "name": "personal"
            }
        ],
        "subtasks": []
    }
}
```

## DELETE /todos/:id

Delete todo.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{
    "success": true,
    "message": "Todo deleted successfully"
}
```

## PUT /todos/:id/status

Update todo status (completion, favorite, etc.).

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `type` (required) - Status type: 'completed', 'favorite', 'started'
-   `value` (optional) - Boolean value, defaults to toggle behavior

**Examples:**

-   `PUT /todos/1/status?type=completed` - Toggle completion status
-   `PUT /todos/1/status?type=completed&value=true` - Mark as completed
-   `PUT /todos/1/status?type=favorite&value=false` - Remove from favorites

**Response (200):**

```json
{
    "success": true,
    "message": "Todo marked as completed",
    "todo": {
        "id": 1,
        "completed": true
    }
}
```

---

# Category Management Routes (`/categories/*`)

All category routes require authentication.

## GET /categories

List user's categories with optional filters and pagination.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `page` (number, default: 1) - Page number
-   `limit` (number, default: 50, max: 100) - Items per page
-   `search` (string) - Search in category names
-   `sort_by` (string, default: "name") - Sort field: name, createdAt, updatedAt
-   `sort_order` (string, default: "ASC") - Sort direction: ASC, DESC
-   `include_todo_count` (boolean, default: false) - Include todo count for each category

**Response (200):**

```json
{
    "success": true,
    "categories": [
        {
            "id": 1,
            "name": "Work",
            "createdAt": "2025-06-14T10:30:00.000Z",
            "updatedAt": "2025-06-14T10:30:00.000Z",
            "todo_count": "5"
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 2,
        "total_items": 8,
        "items_per_page": 50,
        "has_next": true,
        "has_prev": false
    },
    "filters": {
        "search": null,
        "sort_by": "name",
        "sort_order": "ASC",
        "include_todo_count": "true"
    }
}
```

## POST /categories

Create a new category.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "name": "Personal"
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "Category created successfully",
    "category": {
        "id": 2,
        "name": "Personal",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## GET /categories/:id

Get specific category with details.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `include_todos` (boolean, default: false) - Include associated todos

**Response (200):**

```json
{
    "success": true,
    "category": {
        "id": 1,
        "name": "Work",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z",
        "todos": [
            {
                "id": 1,
                "title": "Complete project",
                "completed": false,
                "favorite": true,
                "createdAt": "2025-06-14T10:30:00.000Z"
            }
        ]
    }
}
```

## PUT /categories/:id

Update category.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "name": "Work Projects"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Category updated successfully",
    "category": {
        "id": 1,
        "name": "Work Projects",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## DELETE /categories/:id

Delete category.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `force` (boolean, default: false) - Force delete even if category has todos

**Response (200):**

```json
{
    "success": true,
    "message": "Category deleted successfully",
    "uncategorized_todos": 3
}
```

**Error (409) if category has todos and force=false:**

```json
{
    "error": "Category has associated todos",
    "message": "Cannot delete category with 3 associated todo(s). Use force=true to delete anyway (todos will be uncategorized).",
    "todo_count": 3
}
```

---

# Tag Management Routes (`/tags/*`)

All tag routes require authentication.

## GET /tags

List user's tags with optional filters, pagination & autocomplete support.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `page` (number, default: 1) - Page number
-   `limit` (number, default: 50, max: 100) - Items per page
-   `search` (string) - Search in tag names (supports autocomplete)
-   `sort_by` (string, default: "name") - Sort field: name, createdAt, updatedAt
-   `sort_order` (string, default: "ASC") - Sort direction: ASC, DESC
-   `include_todo_count` (boolean, default: false) - Include todo count for each tag
-   `autocomplete` (boolean, default: false) - Enable autocomplete mode (simplified response)

**Response (200) - Normal mode:**

```json
{
    "success": true,
    "tags": [
        {
            "id": 1,
            "name": "urgent",
            "createdAt": "2025-06-14T10:30:00.000Z",
            "updatedAt": "2025-06-14T10:30:00.000Z",
            "todo_count": "3"
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 2,
        "total_items": 12,
        "items_per_page": 50,
        "has_next": true,
        "has_prev": false
    },
    "filters": {
        "search": null,
        "sort_by": "name",
        "sort_order": "ASC",
        "include_todo_count": "true",
        "autocomplete": "false"
    }
}
```

**Response (200) - Autocomplete mode:**

```json
{
    "success": true,
    "tags": [
        {
            "id": 1,
            "name": "urgent"
        },
        {
            "id": 2,
            "name": "work"
        }
    ],
    "total_items": 12
}
```

## POST /tags

Create a new tag.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "name": "important"
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "Tag created successfully",
    "tag": {
        "id": 3,
        "name": "important",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## GET /tags/:id

Get specific tag with details.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `include_todos` (boolean, default: false) - Include associated todos

**Response (200):**

```json
{
    "success": true,
    "tag": {
        "id": 1,
        "name": "urgent",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z",
        "todos": [
            {
                "id": 1,
                "title": "Complete project",
                "completed": false,
                "favorite": true,
                "createdAt": "2025-06-14T10:30:00.000Z"
            }
        ]
    }
}
```

## PUT /tags/:id

Update tag.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "name": "high-priority"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Tag updated successfully",
    "tag": {
        "id": 1,
        "name": "high-priority",
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## DELETE /tags/:id

Delete tag.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `force` (boolean, default: false) - Force delete even if tag has associated todos

**Response (200):**

```json
{
    "success": true,
    "message": "Tag deleted successfully",
    "removed_from_todos": 5
}
```

**Error (409) if tag has associated todos and force=false:**

```json
{
    "error": "Tag has associated todos",
    "message": "Cannot delete tag with 5 associated todo(s). Use force=true to delete anyway (tag will be removed from todos).",
    "todo_count": 5
}
```

---

# Subtask Management Routes (`/subtasks/*`)

All subtask routes require authentication.

## GET /subtasks

List user's subtasks filtered by todo_id (required).

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `todo_id` (number, required) - Parent todo ID
-   `status` (string) - Filter by status: not_started, in_progress, on_hold, completed
-   `completed` (boolean) - Backward compatibility: filter by completion
-   `include_todo` (boolean, default: false) - Include parent todo details
-   `page` (number, default: 1) - Page number
-   `limit` (number, default: 50, max: 100) - Items per page
-   `sort_by` (string, default: "sequence") - Sort field: sequence, title, status, createdAt, updatedAt
-   `sort_order` (string, default: "ASC") - Sort direction: ASC, DESC

**Response (200):**

```json
{
    "success": true,
    "subtasks": [
        {
            "id": 1,
            "title": "Setup project structure",
            "status": "completed",
            "sequence": 1,
            "todo_id": 1,
            "createdAt": "2025-06-14T10:30:00.000Z",
            "updatedAt": "2025-06-14T10:30:00.000Z",
            "todo": {
                "id": 1,
                "title": "Complete project",
                "completed": false,
                "favorite": true
            }
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 1,
        "total_items": 3,
        "items_per_page": 50,
        "has_next": false,
        "has_prev": false
    },
    "filters": {
        "todo_id": 1,
        "status": null,
        "completed": null,
        "include_todo": "true",
        "sort_by": "sequence",
        "sort_order": "ASC"
    }
}
```

## POST /subtasks

Create a new subtask.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "title": "Write documentation",
    "todo_id": 1,
    "status": "not_started"
}
```

**Backward compatibility:**

```json
{
    "title": "Write tests",
    "todo_id": 1,
    "completed": false
}
```

**Response (201):**

```json
{
    "success": true,
    "message": "Subtask created successfully",
    "subtask": {
        "id": 2,
        "title": "Write documentation",
        "status": "not_started",
        "completed": false,
        "sequence": 2,
        "todo_id": 1,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## PUT /subtasks/reorder

Reorder subtasks for a todo.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "todo_id": 1,
    "subtasks": [
        { "id": 2, "sequence": 1 },
        { "id": 1, "sequence": 2 },
        { "id": 3, "sequence": 3 }
    ]
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Subtasks reordered successfully",
    "subtasks": [
        {
            "id": 2,
            "title": "Write documentation",
            "status": "not_started",
            "completed": false,
            "sequence": 1,
            "todo_id": 1
        },
        {
            "id": 1,
            "title": "Setup project",
            "status": "completed",
            "completed": true,
            "sequence": 2,
            "todo_id": 1
        }
    ]
}
```

## GET /subtasks/:id

Get specific subtask with details.

**Headers:** `Authorization: Bearer <accessToken>`

**Query Parameters:**

-   `include_todo` (boolean, default: false) - Include parent todo details

**Response (200):**

```json
{
    "success": true,
    "subtask": {
        "id": 1,
        "title": "Setup project structure",
        "status": "completed",
        "sequence": 1,
        "todo_id": 1,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z",
        "todo": {
            "id": 1,
            "title": "Complete project",
            "description": "Finish the todo app",
            "completed": false,
            "favorite": true
        }
    }
}
```

## PUT /subtasks/:id

Update subtask.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "title": "Updated subtask title",
    "status": "in_progress"
}
```

**Backward compatibility:**

```json
{
    "title": "Updated subtask title",
    "completed": true
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Subtask updated successfully",
    "subtask": {
        "id": 1,
        "title": "Updated subtask title",
        "status": "in_progress",
        "completed": false,
        "sequence": 1,
        "todo_id": 1,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

## DELETE /subtasks/:id

Delete subtask.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**

```json
{
    "success": true,
    "message": "Subtask deleted successfully"
}
```

## PUT /subtasks/:id/status

Update subtask status.

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
    "status": "completed"
}
```

**Valid status values:**

-   `not_started` - Initial state
-   `in_progress` - Work in progress
-   `on_hold` - Temporarily paused
-   `completed` - Finished

**Response (200):**

```json
{
    "success": true,
    "message": "Subtask status updated to completed",
    "subtask": {
        "id": 1,
        "title": "Setup project structure",
        "status": "completed",
        "completed": true,
        "sequence": 1,
        "todo_id": 1,
        "createdAt": "2025-06-14T10:30:00.000Z",
        "updatedAt": "2025-06-14T10:30:00.000Z"
    }
}
```

---

# Error Codes

## Authentication Errors

-   **401 Unauthorized** - Invalid or missing access token
-   **403 Forbidden** - Token valid but insufficient permissions
-   **409 Conflict** - Email already exists (registration)

## Validation Errors

-   **400 Bad Request** - Invalid request data or parameters
-   **422 Unprocessable Entity** - Request format valid but data validation failed

## Resource Errors

-   **404 Not Found** - Resource doesn't exist or doesn't belong to user
-   **409 Conflict** - Resource conflict (duplicate names, etc.)

## Server Errors

-   **500 Internal Server Error** - Unexpected server error

---

# Rate Limiting

The API implements rate limiting to prevent abuse:

-   **Authentication endpoints**: 5 requests per minute per IP
-   **Other endpoints**: 100 requests per minute per authenticated user

---

# CORS Configuration

The API supports CORS for cross-origin requests:

-   **Allowed Origins**: `http://localhost:3000`, `http://localhost:3001`
-   **Credentials**: Supported (for httpOnly cookies)
-   **Methods**: GET, POST, PUT, DELETE, OPTIONS
-   **Headers**: Authorization, Content-Type, x-refresh-token

---

# Security Features

1. **JWT Authentication** with access/refresh token pattern
2. **HttpOnly Cookies** for refresh tokens
3. **Password Hashing** using bcrypt
4. **Input Validation** and sanitization
5. **Rate Limiting** on sensitive endpoints
6. **CORS Protection** with specific origins
7. **SQL Injection Protection** via Sequelize ORM
8. **User Data Isolation** - users can only access their own data

---

# Client Integration Examples

## Authentication Flow

```javascript
// Login
const loginResponse = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // Important for httpOnly cookies
    body: JSON.stringify({ email, password }),
});

// Store access token
const { accessToken } = await loginResponse.json();
localStorage.setItem("accessToken", accessToken);

// Make authenticated requests
const todosResponse = await fetch("/api/todos", {
    headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    credentials: "include",
});

// Token refresh (automatic via interceptors)
const refreshResponse = await fetch("/api/auth/access-token", {
    credentials: "include", // Sends httpOnly refresh token
});
```

## Todo Management

```javascript
// Create todo with tags
const createTodoResponse = await fetch("/api/todos", {
    method: "POST",
    headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        title: "New Todo",
        description: "Description",
        category_id: 1,
        tag_ids: [1, 2],
    }),
});

// Update todo status
const updateStatusResponse = await fetch(
    "/api/todos/1/status?type=completed&value=true",
    {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
    }
);
```

This comprehensive API documentation covers all available endpoints, request/response formats, authentication, error handling, and practical integration examples.
