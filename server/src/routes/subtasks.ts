import { Router, Request, Response } from "express";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthenticatedRequest } from "../middlewares/base";
import { Subtask } from "../models/Subtask";
import type { SubtaskCreationAttributes } from "../models/Subtask";
import { Todo } from "../models/Todo";
import { Op } from "sequelize";
import { TodoStatusService } from "../services/TodoStatusService";

const router = Router();

/**
 * Subtask Management Routes
 * All subtask-related endpoints grouped under /subtasks/*
 * All routes require authentication
 */

/**
 * GET /subtasks
 * List user's subtasks filtered by todo_id (required)
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
                todo_id,
                status,
                completed, // Keep for backward compatibility
                include_todo = "false",
                page = 1,
                limit = 50,
                sort_by = "sequence",
                sort_order = "ASC",
            } = req.query;

            // todo_id is required for listing subtasks
            if (!todo_id) {
                return res.status(400).json({
                    error: "todo_id parameter is required",
                    message: "Please specify the todo_id to list subtasks for",
                });
            }

            const todoId = parseInt(todo_id as string);
            if (isNaN(todoId)) {
                return res.status(400).json({ error: "Invalid todo_id" });
            }

            // Verify the todo belongs to the user
            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            // Build where clause
            const where: any = { todo_id: todoId };

            // Filter by status if specified (new approach)
            if (status !== undefined) {
                const validStatuses = [
                    "not_started",
                    "in_progress",
                    "on_hold",
                    "completed",
                ];
                if (validStatuses.includes(status as string)) {
                    where.status = status as string;
                }
            }
            // Backward compatibility: filter by completion status if specified
            else if (completed !== undefined) {
                where.status =
                    completed === "true"
                        ? "completed"
                        : { [Op.ne]: "completed" };
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
                "status",
                "createdAt",
                "updatedAt",
            ];
            const sortField = validSortFields.includes(sort_by as string)
                ? (sort_by as string)
                : "sequence";
            const sortDirection = sort_order === "DESC" ? "DESC" : "ASC";

            // Build query options
            const queryOptions: any = {
                where,
                order: [[sortField, sortDirection] as any],
                limit: limitNum,
                offset,
                distinct: true,
            };

            // Include todo details if requested
            if (include_todo === "true") {
                queryOptions.include = [
                    {
                        model: Todo,
                        as: "todo",
                        attributes: ["id", "title", "completed", "favorite"],
                    },
                ];
            }

            const { count, rows: subtasks } = await Subtask.findAndCountAll(
                queryOptions
            );
            const totalPages = Math.ceil(count / limitNum);

            res.json({
                success: true,
                subtasks,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    total_items: count,
                    items_per_page: limitNum,
                    has_next: pageNum < totalPages,
                    has_prev: pageNum > 1,
                },
                filters: {
                    todo_id: todoId,
                    status,
                    completed, // Keep for backward compatibility
                    include_todo,
                    sort_by: sortField,
                    sort_order: sortDirection,
                },
            });
        } catch (error) {
            console.error("List subtasks error:", error);
            res.status(500).json({
                error: "Failed to fetch subtasks",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * POST /subtasks
 * Create new subtask
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
                todo_id,
                status = "not_started",
                completed,
            } = req.body;

            // Validate required fields
            if (!title || typeof title !== "string" || !title.trim()) {
                return res
                    .status(400)
                    .json({ error: "Subtask title is required" });
            }

            if (!todo_id || isNaN(parseInt(todo_id))) {
                return res
                    .status(400)
                    .json({ error: "Valid todo_id is required" });
            }

            const todoId = parseInt(todo_id);

            // Verify the todo belongs to the user
            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            // Create subtask using the model's method (auto-assigns sequence)
            // Handle backward compatibility: if completed is provided and status is not, use completed
            let subtaskStatus = status;
            if (status === "not_started" && completed !== undefined) {
                // Check if status is still default
                subtaskStatus =
                    completed === true ? "completed" : "not_started";
            }
            if (subtaskStatus === undefined) {
                subtaskStatus = "not_started"; // Default status
            }

            const subtask = await Subtask.createForTodo({
                title: title.trim(),
                todo_id: todoId,
                status: subtaskStatus as
                    | "not_started"
                    | "in_progress"
                    | "on_hold"
                    | "completed",
                sequence: 0, // This will be auto-calculated by the model
            });

            res.status(201).json({
                success: true,
                message: "Subtask created successfully",
                subtask: {
                    id: subtask.id,
                    title: subtask.title,
                    status: subtask.status,
                    completed: subtask.status === "completed", // Backward compatibility
                    sequence: subtask.sequence,
                    todo_id: subtask.todo_id,
                    createdAt: subtask.createdAt,
                    updatedAt: subtask.updatedAt,
                },
            });
        } catch (error) {
            console.error("Create subtask error:", error);
            res.status(500).json({
                error: "Failed to create subtask",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /subtasks/reorder
 * Reorder subtasks for a todo
 * NOTE: This route must be BEFORE /:id route to prevent "reorder" being treated as an ID
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

            const { todo_id, subtasks } = req.body;

            // Validate required fields
            if (!todo_id || isNaN(parseInt(todo_id))) {
                return res
                    .status(400)
                    .json({ error: "Valid todo_id is required" });
            }

            if (!Array.isArray(subtasks) || subtasks.length === 0) {
                return res.status(400).json({
                    error: "subtasks array is required",
                    message:
                        "Provide an array of objects with id and sequence fields",
                });
            }

            const todoId = parseInt(todo_id);

            // Verify the todo belongs to the user
            const todo = await Todo.findOne({
                where: {
                    id: todoId,
                    user_id: req.user.userId,
                },
            });

            if (!todo) {
                return res.status(404).json({ error: "Todo not found" });
            }

            // Validate subtasks array format
            for (let i = 0; i < subtasks.length; i++) {
                const item = subtasks[i];

                if (!item.hasOwnProperty("id")) {
                    return res.status(400).json({
                        error: "Invalid subtask ID",
                        message: `Subtask at index ${i} is missing 'id' field`,
                        received: item,
                    });
                }

                if (!item.hasOwnProperty("sequence")) {
                    return res.status(400).json({
                        error: "Invalid subtask ID",
                        message: `Subtask at index ${i} is missing 'sequence' field`,
                        received: item,
                    });
                }

                const parsedId = parseInt(item.id);
                if (isNaN(parsedId)) {
                    return res.status(400).json({
                        error: "Invalid subtask ID",
                        message: `Subtask at index ${i} has invalid 'id' field: ${item.id}`,
                        received: item,
                    });
                }

                const parsedSequence = parseInt(item.sequence);
                if (isNaN(parsedSequence)) {
                    return res.status(400).json({
                        error: "Invalid subtask ID",
                        message: `Subtask at index ${i} has invalid 'sequence' field: ${item.sequence}`,
                        received: item,
                    });
                }
            }

            // Convert to expected format for model method
            const subtaskSequences = subtasks.map((item) => ({
                id: parseInt(item.id),
                sequence: parseInt(item.sequence),
            }));

            // Verify all subtasks belong to the todo
            const subtaskIds = subtaskSequences.map((s) => s.id);

            const existingSubtasks = await Subtask.findAll({
                where: {
                    id: subtaskIds,
                    todo_id: todoId,
                },
            });

            if (existingSubtasks.length !== subtaskIds.length) {
                return res.status(400).json({
                    error: "Invalid subtask ID",
                    message: "One or more subtasks do not belong to this todo",
                    debug: {
                        requested: subtaskIds,
                        found: existingSubtasks.map((s) => s.id),
                        todoId: todoId,
                    },
                });
            }

            // Update sequences using the model method
            await Subtask.updateSequences(subtaskSequences, todoId);

            // Get updated subtasks to return
            const updatedSubtasks = await Subtask.findAll({
                where: { todo_id: todoId },
                order: [["sequence", "ASC"]],
            });

            res.json({
                success: true,
                message: "Subtasks reordered successfully",
                subtasks: updatedSubtasks.map((subtask) => ({
                    id: subtask.id,
                    title: subtask.title,
                    status: subtask.status,
                    completed: subtask.status === "completed", // Backward compatibility
                    sequence: subtask.sequence,
                    todo_id: subtask.todo_id,
                })),
            });
        } catch (error) {
            console.error("Reorder subtasks error:", error);
            res.status(500).json({
                error: "Failed to reorder subtasks",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * GET /subtasks/:id
 * Get specific subtask with details
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

            const subtaskId = parseInt(req.params.id);
            if (isNaN(subtaskId)) {
                return res.status(400).json({ error: "Invalid subtask ID" });
            }

            const { include_todo = "false" } = req.query;

            // Build query options
            const queryOptions: any = {
                include: [
                    {
                        model: Todo,
                        as: "todo",
                        attributes:
                            include_todo === "true"
                                ? [
                                      "id",
                                      "title",
                                      "description",
                                      "completed",
                                      "favorite",
                                      "user_id",
                                  ]
                                : ["user_id"], // Always include user_id for authorization
                        where: {
                            user_id: req.user.userId,
                        },
                    },
                ],
            };

            const subtask = await Subtask.findByPk(subtaskId, queryOptions);

            if (!subtask) {
                return res.status(404).json({ error: "Subtask not found" });
            }

            // Remove user_id from response if not including todo details
            if (include_todo !== "true" && (subtask as any).todo) {
                delete ((subtask as any).todo as any).dataValues.user_id;
            }

            res.json({
                success: true,
                subtask,
            });
        } catch (error) {
            console.error("Get subtask error:", error);
            res.status(500).json({
                error: "Failed to fetch subtask",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /subtasks/:id
 * Update subtask
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

            const subtaskId = parseInt(req.params.id);
            if (isNaN(subtaskId)) {
                return res.status(400).json({ error: "Invalid subtask ID" });
            }

            const { title, status, completed } = req.body;

            // Validate that at least one field is provided
            if (
                title === undefined &&
                status === undefined &&
                completed === undefined
            ) {
                return res.status(400).json({
                    error: "At least one field (title, status, or completed) must be provided",
                });
            }

            // Find subtask and verify ownership
            const subtask = await Subtask.findOne({
                include: [
                    {
                        model: Todo,
                        as: "todo",
                        attributes: ["user_id"],
                        where: {
                            user_id: req.user.userId,
                        },
                    },
                ],
                where: { id: subtaskId },
            });

            if (!subtask) {
                return res.status(404).json({ error: "Subtask not found" });
            }

            // Update fields
            if (title !== undefined) {
                if (typeof title !== "string" || !title.trim()) {
                    return res
                        .status(400)
                        .json({ error: "Title must be a non-empty string" });
                }
                await subtask.updateTitle(title);
            }

            if (status !== undefined) {
                const validStatuses = [
                    "not_started",
                    "in_progress",
                    "on_hold",
                    "completed",
                ];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({
                        error: "Invalid status",
                        valid_statuses: validStatuses,
                    });
                }
                await subtask.updateStatus(status);
            }

            // Backward compatibility for completed field
            if (completed !== undefined && status === undefined) {
                const newStatus = Boolean(completed)
                    ? "completed"
                    : "not_started";
                await subtask.updateStatus(newStatus);
            }

            res.json({
                success: true,
                message: "Subtask updated successfully",
                subtask: {
                    id: subtask.id,
                    title: subtask.title,
                    status: subtask.status,
                    completed: subtask.status === "completed", // Backward compatibility
                    sequence: subtask.sequence,
                    todo_id: subtask.todo_id,
                    createdAt: subtask.createdAt,
                    updatedAt: subtask.updatedAt,
                },
            });
        } catch (error) {
            console.error("Update subtask error:", error);
            res.status(500).json({
                error: "Failed to update subtask",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * DELETE /subtasks/:id
 * Delete subtask
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

            const subtaskId = parseInt(req.params.id);
            if (isNaN(subtaskId)) {
                return res.status(400).json({ error: "Invalid subtask ID" });
            }

            // Find subtask and verify ownership
            const subtask = await Subtask.findOne({
                include: [
                    {
                        model: Todo,
                        as: "todo",
                        attributes: ["user_id"],
                        where: {
                            user_id: req.user.userId,
                        },
                    },
                ],
                where: { id: subtaskId },
            });

            if (!subtask) {
                return res.status(404).json({ error: "Subtask not found" });
            }

            await subtask.destroy();

            res.json({
                success: true,
                message: "Subtask deleted successfully",
            });
        } catch (error) {
            console.error("Delete subtask error:", error);
            res.status(500).json({
                error: "Failed to delete subtask",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /subtasks/:id/status
 * Update subtask status
 * Request body:
 * - status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' (required)
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

            const subtaskId = parseInt(req.params.id);
            if (isNaN(subtaskId)) {
                return res.status(400).json({ error: "Invalid subtask ID" });
            }

            const { status } = req.body;

            // Validate that status is provided
            if (status === undefined) {
                return res.status(400).json({
                    error: "status field is required",
                    valid_statuses: [
                        "not_started",
                        "in_progress",
                        "on_hold",
                        "completed",
                    ],
                });
            }

            // Validate status value
            const validStatuses = [
                "not_started",
                "in_progress",
                "on_hold",
                "completed",
            ];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: "Invalid status value",
                    valid_statuses: validStatuses,
                });
            }

            // Find subtask and verify ownership
            const subtask = await Subtask.findOne({
                include: [
                    {
                        model: Todo,
                        as: "todo",
                        attributes: ["user_id"],
                        where: {
                            user_id: req.user.userId,
                        },
                    },
                ],
                where: { id: subtaskId },
            });

            if (!subtask) {
                return res.status(404).json({ error: "Subtask not found" });
            }

            // Update status
            await subtask.updateStatus(status as any);

            // Update parent todo status based on all subtasks
            await TodoStatusService.updateTodoStatusFromSubtasks(
                subtask.todo_id
            );

            res.json({
                success: true,
                message: `Subtask status updated to ${status}`,
                subtask: {
                    id: subtask.id,
                    title: subtask.title,
                    status: subtask.status,
                    completed: subtask.status === "completed",
                    sequence: subtask.sequence,
                    todo_id: subtask.todo_id,
                    createdAt: subtask.createdAt,
                    updatedAt: subtask.updatedAt,
                },
            });
        } catch (error) {
            console.error("Update subtask status error:", error);
            res.status(500).json({
                error: "Failed to update subtask status",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

export default router;
