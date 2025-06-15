import { Request, Response, NextFunction } from "express";
import { BaseMiddleware, AuthenticatedRequest } from "./base";
import { TokenUtils, JWTPayload } from "../utils/token.utils";
import { RefreshTokenDAO } from "../daos/refresh-token.dao";

/**
 * Authentication Middleware
 * Handles JWT verification and user authentication
 */
export class AuthMiddleware extends BaseMiddleware {
    private static refreshTokenDAO = new RefreshTokenDAO();

    /**
     * Verify JWT access token
     * This middleware can be applied to routes that require authentication
     */
    static verifyToken() {
        return async (
            req: AuthenticatedRequest,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                // Extract token from Authorization header
                const authHeader = req.headers.authorization;
                const token = TokenUtils.extractBearerToken(authHeader);

                if (!token) {
                    AuthMiddleware.sendErrorResponse(
                        res,
                        401,
                        "Access token is required"
                    );
                    return;
                }

                // Verify and decode token
                const decoded: JWTPayload = TokenUtils.verifyAccessToken(token);

                // Attach user info to request
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    name: decoded.name,
                };

                next();
            } catch (error) {
                AuthMiddleware.logError(error, "Token Verification");

                let statusCode = 401;
                let message = "Invalid access token";

                if (error instanceof Error) {
                    if (error.message.includes("expired")) {
                        message = "Access token expired";
                    } else if (error.message.includes("invalid")) {
                        message = "Invalid access token";
                    }
                }

                AuthMiddleware.sendErrorResponse(res, statusCode, message);
            }
        };
    }

    /**
     * Optional authentication middleware
     * Attaches user info if token is valid, but doesn't block request if token is missing/invalid
     */
    static optionalAuth() {
        return async (
            req: AuthenticatedRequest,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const authHeader = req.headers.authorization;
                const token = TokenUtils.extractBearerToken(authHeader);

                if (!token) {
                    next();
                    return;
                }

                const decoded: JWTPayload = TokenUtils.verifyAccessToken(token);

                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    name: decoded.name,
                };

                next();
            } catch (error) {
                // For optional auth, we continue without authentication
                next();
            }
        };
    }

    /**
     * Verify refresh token from cookie or request body
     */
    static verifyRefreshToken() {
        return async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                // Extract refresh token from cookie or body
                const refreshToken =
                    req.cookies?.refreshToken || req.body?.refreshToken;

                if (!refreshToken) {
                    AuthMiddleware.sendErrorResponse(
                        res,
                        401,
                        "Refresh token is required"
                    );
                    return;
                }

                // Verify refresh token exists and is valid
                const tokenRecord =
                    await AuthMiddleware.refreshTokenDAO.findValidToken(
                        refreshToken
                    );

                if (!tokenRecord) {
                    AuthMiddleware.sendErrorResponse(
                        res,
                        401,
                        "Invalid or expired refresh token"
                    );
                    return;
                }

                // Attach token info to request
                (req as any).refreshToken = refreshToken;
                (req as any).tokenRecord = tokenRecord;

                next();
            } catch (error) {
                AuthMiddleware.logError(error, "Refresh Token Verification");
                AuthMiddleware.sendErrorResponse(
                    res,
                    401,
                    "Invalid refresh token"
                );
            }
        };
    }

    /**
     * Check if user has specific permissions (placeholder for future role-based access)
     */
    static requirePermission(permission: string) {
        return (
            req: AuthenticatedRequest,
            res: Response,
            next: NextFunction
        ): void => {
            // For now, just check if user is authenticated
            // In the future, you can add role-based permissions here
            if (!req.user) {
                AuthMiddleware.sendErrorResponse(
                    res,
                    401,
                    "Authentication required"
                );
                return;
            }

            // TODO: Implement permission checking logic
            // Example: Check if user.role has the required permission

            next();
        };
    }

    /**
     * Rate limiting for authentication endpoints
     */
    static authRateLimit() {
        // 5 requests per minute for auth endpoints
        return AuthMiddleware.createRateLimiter(5, 60 * 1000);
    }

    /**
     * Validate authentication request data
     */
    static validateAuthRequest() {
        return (req: Request, res: Response, next: NextFunction): void => {
            const { email, password } = req.body;

            const validation = AuthMiddleware.validateRequiredFields(req.body, [
                "email",
                "password",
            ]);

            if (!validation.valid) {
                AuthMiddleware.sendErrorResponse(
                    res,
                    400,
                    "Missing required fields",
                    { missing: validation.missing }
                );
                return;
            }

            // Basic email validation
            if (!email || typeof email !== "string" || !email.includes("@")) {
                AuthMiddleware.sendErrorResponse(
                    res,
                    400,
                    "Invalid email format"
                );
                return;
            }

            // Basic password validation
            if (
                !password ||
                typeof password !== "string" ||
                password.length < 6
            ) {
                AuthMiddleware.sendErrorResponse(
                    res,
                    400,
                    "Password must be at least 6 characters long"
                );
                return;
            }

            next();
        };
    }

    /**
     * Set secure HTTP-only cookie for refresh token
     */
    static setRefreshTokenCookie(res: Response, refreshToken: string): void {
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });
    }

    /**
     * Clear refresh token cookie
     */
    static clearRefreshTokenCookie(res: Response): void {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
    }
}
