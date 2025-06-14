import { Router, Request, Response } from "express";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthenticatedRequest } from "../middlewares/base";
import { Tag, TagCreationAttributes } from "../models/Tag";
import { Todo } from "../models/Todo";
import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../config/database";

const router = Router();

/**
 * Tag Management Routes
 * All tag-related endpoints grouped under /tags/*
 * All routes require authentication
 */

/**
 * GET /tags
 * List user's tags with optional filters, pagination & autocomplete support
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
                limit = 50,
                search,
                sort_by = "name",
                sort_order = "ASC",
                include_todo_count = "false",
                autocomplete = "false",
            } = req.query;

            // Build where clause
            const where: any = { user_id: req.user.userId };

            // Search in tag names (supports autocomplete)
            if (search) {
                where.name = { [Op.iLike]: `%${search}%` };
            }

            // For autocomplete, use different pagination defaults
            const isAutocomplete = autocomplete === "true";
            const pageNum = Math.max(1, parseInt(page as string));
            const limitNum = isAutocomplete
                ? Math.min(20, Math.max(1, parseInt(limit as string))) // Limit autocomplete to 20 results
                : Math.min(100, Math.max(1, parseInt(limit as string)));
            const offset = (pageNum - 1) * limitNum;

            // Sorting
            const validSortFields = ["name", "createdAt", "updatedAt"];
            const sortField = validSortFields.includes(sort_by as string)
                ? (sort_by as string)
                : "name";
            const sortDirection = sort_order === "DESC" ? "DESC" : "ASC";

            // Build query options
            const queryOptions: any = {
                where,
                order: [[sortField, sortDirection] as any],
                limit: limitNum,
                offset: isAutocomplete ? 0 : offset, // For autocomplete, always start from beginning
                distinct: true,
            };

            // Include todo count if requested
            if (include_todo_count === "true") {
                queryOptions.include = [
                    {
                        model: Todo,
                        as: "todos",
                        attributes: [],
                        required: false,
                        through: { attributes: [] },
                    },
                ];
                queryOptions.attributes = [
                    "id",
                    "name",
                    "createdAt",
                    "updatedAt",
                    [
                        sequelize.fn("COUNT", sequelize.col("todos.id")),
                        "todo_count",
                    ],
                ];
                queryOptions.group = ["Tag.id"];
                queryOptions.subQuery = false;
            }

            const { count, rows: tags } = await Tag.findAndCountAll(
                queryOptions
            );

            // For autocomplete, return simplified response
            if (isAutocomplete) {
                return res.json({
                    success: true,
                    tags: tags.map((tag) => ({
                        id: tag.id,
                        name: tag.name,
                    })),
                    total_items: count,
                });
            }

            const totalPages = Math.ceil(count / limitNum);

            res.json({
                success: true,
                tags,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    total_items: count,
                    items_per_page: limitNum,
                    has_next: pageNum < totalPages,
                    has_prev: pageNum > 1,
                },
                filters: {
                    search,
                    sort_by: sortField,
                    sort_order: sortDirection,
                    include_todo_count,
                    autocomplete,
                },
            });
        } catch (error) {
            console.error("List tags error:", error);
            res.status(500).json({
                error: "Failed to fetch tags",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * POST /tags
 * Create new tag
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

            const { name } = req.body;

            // Validate required fields
            if (!name || typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ error: "Tag name is required" });
            }

            // Create tag using the model's validation
            const tag = await Tag.createForUser(name, req.user.userId);

            res.status(201).json({
                success: true,
                message: "Tag created successfully",
                tag: {
                    id: tag.id,
                    name: tag.name,
                    createdAt: tag.createdAt,
                    updatedAt: tag.updatedAt,
                },
            });
        } catch (error) {
            console.error("Create tag error:", error);

            // Handle duplicate tag name error
            if (
                error instanceof Error &&
                error.message.includes("already exists")
            ) {
                return res.status(409).json({
                    error: "Tag already exists",
                    message: error.message,
                });
            }

            res.status(500).json({
                error: "Failed to create tag",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * GET /tags/:id
 * Get specific tag with details
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

            const tagId = parseInt(req.params.id);
            if (isNaN(tagId)) {
                return res.status(400).json({ error: "Invalid tag ID" });
            }

            const { include_todos = "false" } = req.query;

            // Build query options
            const queryOptions: any = {
                where: {
                    id: tagId,
                    user_id: req.user.userId,
                },
            };

            // Include todos if requested
            if (include_todos === "true") {
                queryOptions.include = [
                    {
                        model: Todo,
                        as: "todos",
                        attributes: [
                            "id",
                            "title",
                            "completed",
                            "favorite",
                            "createdAt",
                        ],
                        through: { attributes: [] },
                        order: [["sequence", "ASC"]],
                    },
                ];
            }

            const tag = await Tag.findOne(queryOptions);

            if (!tag) {
                return res.status(404).json({ error: "Tag not found" });
            }

            res.json({
                success: true,
                tag,
            });
        } catch (error) {
            console.error("Get tag error:", error);
            res.status(500).json({
                error: "Failed to fetch tag",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /tags/:id
 * Update tag
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

            const tagId = parseInt(req.params.id);
            if (isNaN(tagId)) {
                return res.status(400).json({ error: "Invalid tag ID" });
            }

            const { name } = req.body;

            // Validate required fields
            if (!name || typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ error: "Tag name is required" });
            }

            const tag = await Tag.findOne({
                where: {
                    id: tagId,
                    user_id: req.user.userId,
                },
            });

            if (!tag) {
                return res.status(404).json({ error: "Tag not found" });
            }

            // Update tag using the model's validation
            await tag.updateName(name);

            res.json({
                success: true,
                message: "Tag updated successfully",
                tag: {
                    id: tag.id,
                    name: tag.name,
                    createdAt: tag.createdAt,
                    updatedAt: tag.updatedAt,
                },
            });
        } catch (error) {
            console.error("Update tag error:", error);

            // Handle duplicate tag name error
            if (
                error instanceof Error &&
                error.message.includes("already exists")
            ) {
                return res.status(409).json({
                    error: "Tag already exists",
                    message: error.message,
                });
            }

            res.status(500).json({
                error: "Failed to update tag",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * DELETE /tags/:id
 * Delete tag
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

            const tagId = parseInt(req.params.id);
            if (isNaN(tagId)) {
                return res.status(400).json({ error: "Invalid tag ID" });
            }

            const { force = "false" } = req.query;

            const tag = await Tag.findOne({
                where: {
                    id: tagId,
                    user_id: req.user.userId,
                },
            });

            if (!tag) {
                return res.status(404).json({ error: "Tag not found" });
            }

            // Check if tag has associated todos (many-to-many relationship)
            const todoCount = await sequelize.query(
                `SELECT COUNT(*) as count FROM todo_tags 
             JOIN todos ON todo_tags.todo_id = todos.id 
             WHERE todo_tags.tag_id = :tagId AND todos.user_id = :userId`,
                {
                    replacements: { tagId, userId: req.user.userId },
                    type: QueryTypes.SELECT,
                }
            );

            const associatedTodos = (todoCount[0] as any).count;

            if (associatedTodos > 0 && force !== "true") {
                return res.status(409).json({
                    error: "Tag has associated todos",
                    message: `Cannot delete tag with ${associatedTodos} associated todo(s). Use force=true to delete anyway (tag will be removed from todos).`,
                    todo_count: associatedTodos,
                });
            }

            // If force delete, remove tag associations from todos
            if (associatedTodos > 0 && force === "true") {
                await sequelize.query(
                    `DELETE FROM todo_tags 
                 WHERE tag_id = :tagId 
                 AND todo_id IN (SELECT id FROM todos WHERE user_id = :userId)`,
                    {
                        replacements: { tagId, userId: req.user.userId },
                        type: QueryTypes.DELETE,
                    }
                );
            }

            await tag.destroy();

            res.json({
                success: true,
                message: "Tag deleted successfully",
                removed_from_todos: force === "true" ? associatedTodos : 0,
            });
        } catch (error) {
            console.error("Delete tag error:", error);
            res.status(500).json({
                error: "Failed to delete tag",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

export default router;
