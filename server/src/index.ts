import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { databaseConnection } from "./config/database";
import { User, Category, Tag, Todo, Subtask } from "./models";
import { TokenUtils } from "./utils/token.utils";
// Import routes
import apiRoutes from "./routes";
// Import authentication middleware for protected routes
import { AuthMiddleware } from "./middlewares/auth";
import { AuthenticatedRequest } from "./middlewares/base";

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api", apiRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello World! TypeScript Node.js server is running!",
        timestamp: new Date().toISOString(),
    });
});

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
    try {
        const dbConnected = await databaseConnection.testConnection();
        res.json({
            status: "OK",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: dbConnected ? "Connected" : "Disconnected",
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: "Error",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// Basic API endpoints for testing
app.get("/api/users", async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "email", "name", "created_at"],
        });
        res.json({ users });
    } catch (error) {
        console.error("Users fetch error:", error);
        res.status(500).json({
            error: "Failed to fetch users",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

app.get("/api/stats", async (req: Request, res: Response) => {
    try {
        const stats = {
            users: await User.count(),
            categories: await Category.count(),
            tags: await Tag.count(),
            todos: await Todo.count(),
            completedTodos: await Todo.count({ where: { completed: true } }),
            subtasks: await Subtask.count(),
        };
        res.json({ stats });
    } catch (error) {
        console.error("Stats fetch error:", error);
        res.status(500).json({
            error: "Failed to fetch statistics",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// Demo page route
app.get("/demo", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/auth-demo.html"));
});

// 404 handler
app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
    });
});

// Start server
const startServer = async () => {
    try {
        // Validate JWT configuration
        TokenUtils.validateConfiguration();

        // Test database connection
        const dbConnected = await databaseConnection.testConnection();

        if (!dbConnected) {
            console.log("⚠️  Starting server without database connection");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(
                `🗄️  Database: ${dbConnected ? "Connected" : "Disconnected"}`
            );
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    await databaseConnection.closeConnection();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    await databaseConnection.closeConnection();
    process.exit(0);
});

// Start the server
startServer();

export default app;
