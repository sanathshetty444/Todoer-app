import { Router } from "express";
import authRoutes from "./auth";
import todoRoutes from "./todos";
import categoryRoutes from "./categories";
import tagRoutes from "./tags";
import subtaskRoutes from "./subtasks";

const router = Router();

/**
 * Main routes index
 * Combines all route modules
 */

// Authentication & User Management Routes
router.use("/auth", authRoutes);

// Todo Management Routes
router.use("/todos", todoRoutes);

// Category Management Routes
router.use("/categories", categoryRoutes);

// Tag Management Routes
router.use("/tags", tagRoutes);

// Subtask Management Routes
router.use("/subtasks", subtaskRoutes);

// Health check route
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;
