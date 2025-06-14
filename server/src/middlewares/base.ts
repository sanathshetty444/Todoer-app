import { Request, Response, NextFunction } from "express";

/**
 * Base Middleware
 * Common middleware utilities and base class for all middlewares
 */

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
        name: string;
    };
}

export class BaseMiddleware {
    /**
     * Send standardized error response
     */
    protected static sendErrorResponse(
        res: Response,
        statusCode: number,
        message: string,
        details?: any
    ): void {
        res.status(statusCode).json({
            success: false,
            error: {
                message,
                timestamp: new Date().toISOString(),
                ...(details && { details }),
            },
        });
    }

    /**
     * Send standardized success response
     */
    protected static sendSuccessResponse(
        res: Response,
        data?: any,
        message?: string,
        statusCode: number = 200
    ): void {
        res.status(statusCode).json({
            success: true,
            ...(message && { message }),
            ...(data && { data }),
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Log middleware errors
     */
    protected static logError(error: any, context: string): void {
        console.error(`[${context}] Middleware Error:`, {
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Validate required fields in request body
     */
    protected static validateRequiredFields(
        body: any,
        requiredFields: string[]
    ): { valid: boolean; missing: string[] } {
        const missing = requiredFields.filter((field) => !body[field]);
        return {
            valid: missing.length === 0,
            missing,
        };
    }

    /**
     * Sanitize user input
     */
    protected static sanitizeInput(input: string): string {
        return input.trim().toLowerCase();
    }

    /**
     * Rate limiting helper (basic implementation)
     */
    protected static createRateLimiter(
        maxRequests: number,
        windowMs: number
    ): (req: Request, res: Response, next: NextFunction) => void {
        const requests = new Map<
            string,
            { count: number; resetTime: number }
        >();

        return (req: Request, res: Response, next: NextFunction) => {
            const key = req.ip || "unknown";
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean up old entries
            for (const [ip, data] of requests.entries()) {
                if (data.resetTime < windowStart) {
                    requests.delete(ip);
                }
            }

            const userRequests = requests.get(key);

            if (!userRequests) {
                requests.set(key, { count: 1, resetTime: now + windowMs });
                next();
                return;
            }

            if (userRequests.count >= maxRequests) {
                BaseMiddleware.sendErrorResponse(
                    res,
                    429,
                    "Too many requests. Please try again later.",
                    {
                        retryAfter: Math.ceil(
                            (userRequests.resetTime - now) / 1000
                        ),
                    }
                );
                return;
            }

            userRequests.count++;
            next();
        };
    }

    /**
     * CORS middleware
     */
    static cors() {
        return (req: Request, res: Response, next: NextFunction) => {
            res.header(
                "Access-Control-Allow-Origin",
                process.env.ALLOWED_ORIGINS || "*"
            );
            res.header(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, PATCH, OPTIONS"
            );
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            );
            res.header("Access-Control-Allow-Credentials", "true");

            if (req.method === "OPTIONS") {
                res.sendStatus(200);
                return;
            }

            next();
        };
    }

    /**
     * Request logging middleware
     */
    static requestLogger() {
        return (req: Request, res: Response, next: NextFunction) => {
            const start = Date.now();

            res.on("finish", () => {
                const duration = Date.now() - start;
                console.log(
                    `[${new Date().toISOString()}] ${req.method} ${
                        req.path
                    } - ${res.statusCode} (${duration}ms)`
                );
            });

            next();
        };
    }

    /**
     * Error handling middleware
     */
    static errorHandler() {
        return (
            error: any,
            req: Request,
            res: Response,
            next: NextFunction
        ) => {
            BaseMiddleware.logError(error, "Global Error Handler");

            if (res.headersSent) {
                return next(error);
            }

            BaseMiddleware.sendErrorResponse(
                res,
                error.statusCode || 500,
                error.message || "Internal Server Error",
                process.env.NODE_ENV === "development"
                    ? { stack: error.stack }
                    : undefined
            );
        };
    }

    /**
     * Not found middleware
     */
    static notFound() {
        return (req: Request, res: Response) => {
            BaseMiddleware.sendErrorResponse(
                res,
                404,
                `Route ${req.method} ${req.path} not found`
            );
        };
    }
}
