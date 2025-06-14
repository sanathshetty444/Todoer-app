import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthenticatedRequest } from "../middlewares/base";
import { UserDAO } from "../daos/user.dao";

const router = Router();

/**
 * Authentication Routes
 * All auth-related endpoints grouped under /auth/*
 */

/**
 * POST /auth/register
 * User registration with validation
 */
router.post("/register", async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    try {
        // Validate request data
        if (!email || !password || !name) {
            return res.status(400).json({
                error: "All fields are required",
                details: { email: !!email, password: !!password, name: !!name },
            });
        }

        // Validate email format
        if (!AuthService.validateEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Validate password strength
        const passwordValidation = AuthService.validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                error: "Password does not meet requirements",
                details: passwordValidation.errors,
            });
        }

        // Create auth service instance and register
        const authService = new AuthService();
        const registerResult = await authService.register({
            email,
            password,
            name,
        });

        // Set refresh token as HTTP-only cookie
        AuthMiddleware.setRefreshTokenCookie(
            res,
            registerResult.tokens.refreshToken
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: registerResult.user,
            accessToken: registerResult.tokens.accessToken,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            error: "Failed to register user",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * POST /auth/login
 * User authentication (returns both tokens)
 */
router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        // Validate request data
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
                details: { email: !!email, password: !!password },
            });
        }

        // Create auth service instance and login
        const authService = new AuthService();
        const loginResult = await authService.login({ email, password });

        // Set refresh token as HTTP-only cookie
        AuthMiddleware.setRefreshTokenCookie(
            res,
            loginResult.tokens.refreshToken
        );

        res.json({
            success: true,
            message: "Login successful",
            user: loginResult.user,
            accessToken: loginResult.tokens.accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            error: "Failed to login",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * POST /auth/logout
 * Clear session/invalidate token
 */
router.post("/logout", async (req: Request, res: Response) => {
    try {
        const refreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (refreshToken) {
            const authService = new AuthService();
            await authService.logout(refreshToken);
        }

        // Clear the refresh token cookie
        AuthMiddleware.clearRefreshTokenCookie(res);

        res.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            error: "Logout failed",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * GET /auth/me
 * Get current user profile (requires authentication)
 */
router.get(
    "/me",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const userDAO = new UserDAO();
            const user = await userDAO.findPublicById(req.user.userId);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            });
        } catch (error) {
            console.error("Get user profile error:", error);
            res.status(500).json({
                error: "Failed to fetch user profile",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * PUT /auth/me
 * Update user profile (requires authentication)
 */
router.put(
    "/me",
    AuthMiddleware.verifyToken(),
    async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            const { name, email } = req.body;
            const userDAO = new UserDAO();

            // Build update data
            const updateData: any = {};
            if (name && name.trim()) {
                updateData.name = name.trim();
            }
            if (email && email.trim()) {
                // Validate email format
                if (!AuthService.validateEmail(email)) {
                    return res
                        .status(400)
                        .json({ error: "Invalid email format" });
                }

                // Check if email is already taken by another user
                const emailExists = await userDAO.emailExists(
                    email,
                    req.user.userId
                );
                if (emailExists) {
                    return res
                        .status(409)
                        .json({ error: "Email is already taken" });
                }
                updateData.email = email.toLowerCase();
            }

            // Check if there's anything to update
            if (Object.keys(updateData).length === 0) {
                return res
                    .status(400)
                    .json({ error: "No valid fields to update" });
            }

            // Update user
            await userDAO.updateById(req.user.userId, updateData);

            // Fetch updated user data
            const updatedUser = await userDAO.findPublicById(req.user.userId);

            res.json({
                success: true,
                message: "Profile updated successfully",
                user: {
                    id: updatedUser!.id,
                    email: updatedUser!.email,
                    name: updatedUser!.name,
                    createdAt: updatedUser!.createdAt,
                    updatedAt: updatedUser!.updatedAt,
                },
            });
        } catch (error) {
            console.error("Update user profile error:", error);
            res.status(500).json({
                error: "Failed to update user profile",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
);

/**
 * GET /auth/access-token
 * Get new access token using refresh token
 */
router.get("/access-token", async (req: Request, res: Response) => {
    try {
        const refreshToken =
            req.cookies?.refreshToken ||
            req.body?.refreshToken ||
            req.headers["x-refresh-token"];

        if (!refreshToken) {
            return res.status(401).json({
                error: "Refresh token is required",
                hint: "Provide refresh token in cookie, body, or x-refresh-token header",
            });
        }

        const authService = new AuthService();
        const refreshResult = await authService.refreshAccessToken(
            refreshToken as string
        );

        res.json({
            success: true,
            accessToken: refreshResult.accessToken,
            message: "Access token refreshed successfully",
        });
    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(401).json({
            error: "Token refresh failed",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * POST /auth/refresh (Alternative endpoint for refresh)
 * Get new access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
    try {
        const refreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token is required" });
        }

        const authService = new AuthService();
        const refreshResult = await authService.refreshAccessToken(
            refreshToken
        );

        res.json({
            success: true,
            accessToken: refreshResult.accessToken,
            message: "Access token refreshed successfully",
        });
    } catch (error) {
        console.error("Token refresh error:", error);
        res.status(401).json({
            error: "Token refresh failed",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
