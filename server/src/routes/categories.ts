import { Router, Request, Response } from "express";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthenticatedRequest } from "../middlewares/base";
import { Category, CategoryCreationAttributes } from "../models/Category";
import { Todo } from "../models/Todo";
import { Op } from "sequelize";
import { sequelize } from "../config/database";

const router = Router();

/**
 * Category Management Routes
 * All category-related endpoints grouped under /categories/*
 * All routes require authentication
 */

/**
 * GET /categories
 * List user's categories with optional filters & pagination
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
            } = req.query;

            console.log("Request query parameters:", req.user);

            // Build where clause
            const where: any = { user_id: req.user.userId };

            // Search in category names
            if (search) {
                where.name = { [Op.iLike]: `%${search}%` };
            }

            // Pagination
            const pageNum = Math.max(1, parseInt(page as string));
            const limitNum = Math.min(
                100,
                Math.max(1, parseInt(limit as string))
            );
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
                offset,
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
                queryOptions.group = ["Category.id"];
                queryOptions.subQuery = false;
            }

            const { count, rows: categories } = await Category.findAndCountAll(
                queryOptions
            );

            const totalPages = Math.ceil(count / limitNum);

            res.json({
                success: true,
                categories,
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
                },
            });
        } catch (error) {
            console.error("List categories error:", error);
            res.status(500).json({
                error: "Failed to fetch categories",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * POST /categories
 * Create new category
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
                return res
                    .status(400)
                    .json({ error: "Category name is required" });
            }

            // Create category using the model's validation
            const category = await Category.createForUser(
                name,
                req.user.userId
            );

            res.status(201).json({
                success: true,
                message: "Category created successfully",
                category: {
                    id: category.id,
                    name: category.name,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                },
            });
        } catch (error) {
            console.error("Create category error:", error);

            // Handle duplicate category name error
            if (
                error instanceof Error &&
                error.message.includes("already exists")
            ) {
                return res.status(409).json({
                    error: "Category already exists",
                    message: error.message,
                });
            }

            res.status(500).json({
                error: "Failed to create category",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * GET /categories/:id
 * Get specific category with details
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

            const categoryId = parseInt(req.params.id);
            if (isNaN(categoryId)) {
                return res.status(400).json({ error: "Invalid category ID" });
            }

            const { include_todos = "false" } = req.query;

            // Build query options
            const queryOptions: any = {
                where: {
                    id: categoryId,
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
                        order: [["sequence", "ASC"]],
                    },
                ];
            }

            const category = await Category.findOne(queryOptions);

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            res.json({
                success: true,
                category,
            });
        } catch (error) {
            console.error("Get category error:", error);
            res.status(500).json({
                error: "Failed to fetch category",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /categories/:id
 * Update category
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

            const categoryId = parseInt(req.params.id);
            if (isNaN(categoryId)) {
                return res.status(400).json({ error: "Invalid category ID" });
            }

            const { name } = req.body;

            // Validate required fields
            if (!name || typeof name !== "string" || !name.trim()) {
                return res
                    .status(400)
                    .json({ error: "Category name is required" });
            }

            const category = await Category.findOne({
                where: {
                    id: categoryId,
                    user_id: req.user.userId,
                },
            });

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            // Update category using the model's validation
            await category.updateName(name);

            res.json({
                success: true,
                message: "Category updated successfully",
                category: {
                    id: category.id,
                    name: category.name,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt,
                },
            });
        } catch (error) {
            console.error("Update category error:", error);

            // Handle duplicate category name error
            if (
                error instanceof Error &&
                error.message.includes("already exists")
            ) {
                return res.status(409).json({
                    error: "Category already exists",
                    message: error.message,
                });
            }

            res.status(500).json({
                error: "Failed to update category",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * DELETE /categories/:id
 * Delete category
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

            const categoryId = parseInt(req.params.id);
            if (isNaN(categoryId)) {
                return res.status(400).json({ error: "Invalid category ID" });
            }

            const { force = "false" } = req.query;

            const category = await Category.findOne({
                where: {
                    id: categoryId,
                    user_id: req.user.userId,
                },
            });

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            // Check if category has associated todos
            const todoCount = await Todo.count({
                where: {
                    category_id: categoryId,
                    user_id: req.user.userId,
                },
            });

            if (todoCount > 0 && force !== "true") {
                return res.status(409).json({
                    error: "Category has associated todos",
                    message: `Cannot delete category with ${todoCount} associated todo(s). Use force=true to delete anyway (todos will be uncategorized).`,
                    todo_count: todoCount,
                });
            }

            // If force delete, update todos to remove category reference
            if (todoCount > 0 && force === "true") {
                await Todo.update(
                    { category_id: null },
                    {
                        where: {
                            category_id: categoryId,
                            user_id: req.user.userId,
                        },
                    }
                );
            }

            await category.destroy();

            res.json({
                success: true,
                message: "Category deleted successfully",
                uncategorized_todos: force === "true" ? todoCount : 0,
            });
        } catch (error) {
            console.error("Delete category error:", error);
            res.status(500).json({
                error: "Failed to delete category",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

export default router;
