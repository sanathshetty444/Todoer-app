import { Router, Request, Response } from "express";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthenticatedRequest } from "../middlewares/base";
import { Todo, TodoCreationAttributes } from "../models/Todo";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { Tag } from "../models/Tag";
import { Subtask } from "../models/Subtask";
import { Op } from "sequelize";

const router = Router();

/**
 * Todo Management Routes
 * All todo-related endpoints grouped under /todos/*
 * All routes require authentication
 */

/**
 * GET /todos
 * List user's todos with filters & pagination
 */
router.get(
    "/",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const {
                page = 1,
                limit = 10,
                completed,
                favorite,
                category_id,
                search,
                sort_by = "sequence",
                sort_order = "ASC",
                status,
            } = req.query;

            // Build where clause
            const where: any = { user_id: req.user.userId };

            // Filter by completion status
            if (completed !== undefined) {
                where.completed = completed === "true";
            }

            // Filter by favorite status
            if (favorite !== undefined) {
                where.favorite = favorite === "true";
            }

            // Filter by category
            if (category_id) {
                where.category_id = parseInt(category_id as string);
            }

            // Search in title and description
            if (search) {
                where[Op.or] = [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } },
                ];
            }

            if (status) {
                where[Op.or] = [{ status: { [Op.eq]: `${status}` } }];
            }

            // Pagination
            const pageNum = Math.max(1, parseInt(page as string));
            const limitNum = Math.min(
                100,
                Math.max(1, parseInt(limit as string))
            );
            const offset = (pageNum - 1) * limitNum;

            // Sorting
            const validSortFields = [
                "sequence",
                "title",
                "created_at",
                "updated_at",
                "completed",
            ];
            const sortField = validSortFields.includes(sort_by as string)
                ? (sort_by as string)
                : "sequence";
            const sortDirection = sort_order === "DESC" ? "DESC" : "ASC";

            const { count, rows: todos } = await Todo.findAndCountAll({
                where,
                include: [
                    { model: User, as: "user", attributes: ["name", "email"] },
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: Tag,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                    },
                    {
                        model: Subtask,
                        as: "subtasks",
                        attributes: ["id", "title", "status"],
                        order: [["sequence", "ASC"]],
                    },
                ],
                order: [[sortField, sortDirection] as any],
                limit: limitNum,
                offset,
                distinct: true,
            });

            const totalPages = Math.ceil(count / limitNum);

            res.json({
                success: true,
                todos,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    total_items: count,
                    items_per_page: limitNum,
                    has_next: pageNum < totalPages,
                    has_prev: pageNum > 1,
                },
                filters: {
                    completed,
                    favorite,
                    category_id,
                    search,
                    sort_by: sortField,
                    sort_order: sortDirection,
                },
            });
        } catch (error) {
            console.error("List todos error:", error);
            res.status(500).json({
                error: "Failed to fetch todos",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * POST /todos
 * Create new todo
 */
router.post(
    "/",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const {
                title,
                description,
                category_id,
                favorite = false,
                tag_ids = [],
            } = req.body;

            // Validate required fields
            if (!title || typeof title !== "string" || !title.trim()) {
                return res.status(400).json({ error: "Title is required" });
            }

            // Validate category if provided
            if (category_id) {
                const category = await Category.findOne({
                    where: { id: category_id, user_id: req.user.userId },
                });
                if (!category) {
                    return res
                        .status(400)
                        .json({ error: "Invalid category ID" });
                }
            }

            // Create todo
            const todoData: TodoCreationAttributes = {
                title: title.trim(),
                description: description?.trim() || null,
                user_id: req.user.userId,
                category_id: category_id || null,
                favorite: Boolean(favorite),
                completed: false,
                sequence: 0, // Will be auto-calculated by the model
            };

            const todo = await Todo.createForUser(todoData);

            // Add tags if provided
            if (tag_ids.length > 0) {
                const validTags = await Tag.findAll({
                    where: {
                        id: { [Op.in]: tag_ids },
                        user_id: req.user.userId,
                    },
                });
                await (todo as any).setTags(validTags);
            }

            // Fetch the created todo with relationships
            const createdTodo = await Todo.findByPk(todo.id, {
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: Tag,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                    },
                ],
            });

            res.status(201).json({
                success: true,
                message: "Todo created successfully",
                todo: createdTodo,
            });
        } catch (error) {
            console.error("Create todo error:", error);
            res.status(500).json({
                error: "Failed to create todo",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /todos/reorder
 * Bulk reorder todos (drag-drop)
 */
router.put(
    "/reorder",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const { todo_orders } = req.body;

            if (!Array.isArray(todo_orders)) {
                return res
                    .status(400)
                    .json({ error: "todo_orders must be an array" });
            }

            // Validate format: [{ id: number, sequence: number }, ...]
            for (const item of todo_orders) {
                if (!item.id || typeof item.sequence !== "number") {
                    return res.status(400).json({
                        error: "Each item must have id and sequence properties",
                    });
                }
            }

            // Update sequences in a transaction
            const updates = todo_orders.map(async (item) => {
                const todo = await Todo.findOne({
                    where: {
                        id: item.id,
                        user_id: req.user!.userId,
                    },
                });

                if (todo) {
                    await todo.updateSequence(item.sequence);
                }
            });

            await Promise.all(updates);

            res.json({
                success: true,
                message: "Todos reordered successfully",
                updated_count: todo_orders.length,
            });
        } catch (error) {
            console.error("Reorder todos error:", error);
            res.status(500).json({
                error: "Failed to reorder todos",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * GET /todos/:id
 * Get specific todo with relationships
 */
router.get(
    "/:id",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: Tag,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                    },
                    {
                        model: Subtask,
                        as: "subtasks",
                        attributes: ["id", "title", "completed", "sequence"],
                    },
                ],
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            res.json({
                success: true,
                todo,
            });
        } catch (error) {
            console.error("Get todo error:", error);
            res.status(500).json({
                error: "Failed to fetch todo",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /todos/:id
 * Update todo (title, status, category, etc.)
 */
router.put(
    "/:id",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const {
                title,
                description,
                category_id,
                favorite,
                completed,
                tag_ids,
            } = req.body;

            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            // Build update data
            const updateData: any = {};

            if (title !== undefined) {
                if (typeof title !== "string" || !title.trim()) {
                    return res
                        .status(400)
                        .json({ error: "Title cannot be empty" });
                }
                updateData.title = title.trim();
            }

            if (description !== undefined) {
                updateData.description = description?.trim() || null;
            }

            if (category_id !== undefined) {
                if (category_id === null) {
                    updateData.category_id = null;
                } else {
                    const category = await Category.findOne({
                        where: { id: category_id, user_id: req.user.userId },
                    });
                    if (!category) {
                        return res
                            .status(400)
                            .json({ error: "Invalid category ID" });
                    }
                    updateData.category_id = category_id;
                }
            }

            if (favorite !== undefined) {
                updateData.favorite = Boolean(favorite);
            }

            if (completed !== undefined) {
                updateData.completed = Boolean(completed);
            }

            // Update todo
            await todo.update(updateData);

            // Update tags if provided
            if (tag_ids !== undefined) {
                if (Array.isArray(tag_ids)) {
                    const validTags = await Tag.findAll({
                        where: {
                            id: { [Op.in]: tag_ids },
                            user_id: req.user.userId,
                        },
                    });
                    await (todo as any).setTags(validTags);
                } else {
                    await (todo as any).setTags([]);
                }
            }

            // Fetch updated todo with relationships
            const updatedTodo = await Todo.findByPk(todo.id, {
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: Tag,
                        as: "tags",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                    },
                    {
                        model: Subtask,
                        as: "subtasks",
                        attributes: ["id", "title", "completed"],
                    },
                ],
            });

            res.json({
                success: true,
                message: "Todo updated successfully",
                todo: updatedTodo,
            });
        } catch (error) {
            console.error("Update todo error:", error);
            res.status(500).json({
                error: "Failed to update todo",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * DELETE /todos/:id
 * Delete todo
 */
router.delete(
    "/:id",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            await todo.destroy();

            res.json({
                success: true,
                message: "Todo deleted successfully",
            });
        } catch (error) {
            console.error("Delete todo error:", error);
            res.status(500).json({
                error: "Failed to delete todo",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /todos/:id/status
 * Update todo status (completion, favorite, etc.)
 * Query parameters:
 * - type: 'completed' | 'favorite' | 'started' (required)
 * - value: boolean (optional, defaults to toggle behavior)
 */
router.put(
    "/:id/status",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const todoId = parseInt(req.params.id);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo ID" });
            }

            const { type, value } = req.query;

            // Validate status type
            const validStatusTypes = ["completed", "favorite", "started"];
            if (!type || !validStatusTypes.includes(type as string)) {
                return res.status(400).json({
                    error: "Invalid status type",
                    valid_types: validStatusTypes,
                });
            }

            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            let updatedField: string;
            let newValue: boolean;
            let message: string;

            switch (type) {
                case "completed":
                    if (value !== undefined) {
                        newValue = value === "true";
                        await todo.update({ completed: newValue });
                    } else {
                        await todo.toggleCompleted();
                        newValue = todo.completed;
                    }
                    updatedField = "completed";
                    message = `Todo marked as ${
                        newValue ? "completed" : "incomplete"
                    }`;
                    break;

                case "favorite":
                    if (value !== undefined) {
                        newValue = value === "true";
                        await todo.update({ favorite: newValue });
                    } else {
                        await todo.toggleFavorite();
                        newValue = todo.favorite;
                    }
                    updatedField = "favorite";
                    message = `Todo ${
                        newValue ? "added to" : "removed from"
                    } favorites`;
                    break;

                case "started":
                    // Future implementation for started status
                    // This could be a new field in the Todo model
                    return res.status(501).json({
                        error: "Started status not yet implemented",
                        message:
                            "This feature will be available in future updates",
                    });

                default:
                    return res
                        .status(400)
                        .json({ error: "Invalid status type" });
            }

            res.json({
                success: true,
                message,
                todo: {
                    id: todo.id,
                    [updatedField]: newValue,
                },
            });
        } catch (error) {
            console.error("Update status error:", error);
            res.status(500).json({
                error: "Failed to update status",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

export default router;
