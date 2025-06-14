import {
    sign,
    verify,
    decode,
    JsonWebTokenError,
    TokenExpiredError,
    SignOptions,
} from "jsonwebtoken";
import crypto from "crypto";

/**
 * JWT and Token Utilities
 * Handles JWT creation, verification, and refresh token generation
 */

export interface JWTPayload {
    userId: number;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class TokenUtils {
    private static readonly ACCESS_TOKEN_SECRET =
        process.env.JWT_ACCESS_SECRET || "your-access-token-secret-key";
    private static readonly ACCESS_TOKEN_EXPIRY =
        process.env.JWT_ACCESS_EXPIRY || "30m";
    private static readonly REFRESH_TOKEN_EXPIRY_DAYS = parseInt(
        process.env.REFRESH_TOKEN_EXPIRY_DAYS || "7"
    );

    /**
     * Generate JWT Access Token
     */
    static generateAccessToken(
        payload: Omit<JWTPayload, "iat" | "exp">
    ): string {
        try {
            const secret = this.ACCESS_TOKEN_SECRET;
            if (!secret || typeof secret !== "string") {
                throw new Error("ACCESS_TOKEN_SECRET must be a valid string");
            }

            return sign(payload as any, secret, {
                expiresIn: "30m", // hardcode for now to avoid type issues
                issuer: "todo-app",
                audience: "todo-app-users",
            });
        } catch (error) {
            throw new Error(`Failed to generate access token: ${error}`);
        }
    }

    /**
     * Verify JWT Access Token
     */
    static verifyAccessToken(token: string): JWTPayload {
        try {
            const decoded = verify(token, this.ACCESS_TOKEN_SECRET, {
                issuer: "todo-app",
                audience: "todo-app-users",
            }) as JWTPayload;

            return decoded;
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                throw new Error("Invalid access token");
            }
            if (error instanceof TokenExpiredError) {
                throw new Error("Access token expired");
            }
            throw new Error(`Token verification failed: ${error}`);
        }
    }

    /**
     * Generate cryptographically secure refresh token
     */
    static generateRefreshToken(): string {
        try {
            return crypto.randomBytes(32).toString("hex");
        } catch (error) {
            throw new Error(`Failed to generate refresh token: ${error}`);
        }
    }

    /**
     * Calculate refresh token expiration date
     */
    static getRefreshTokenExpiry(): Date {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);
        return expiry;
    }

    /**
     * Extract token from Authorization header
     */
    static extractBearerToken(authHeader?: string): string | null {
        if (!authHeader) {
            return null;
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return null;
        }

        return parts[1];
    }

    /**
     * Decode JWT without verification (for debugging)
     */
    static decodeToken(token: string): any {
        try {
            return decode(token);
        } catch (error) {
            throw new Error(`Failed to decode token: ${error}`);
        }
    }

    /**
     * Check if JWT is expired without verification
     */
    static isTokenExpired(token: string): boolean {
        try {
            const decoded = decode(token) as any;
            if (!decoded || !decoded.exp) {
                return true;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    /**
     * Get token expiration time
     */
    static getTokenExpiration(token: string): Date | null {
        try {
            const decoded = decode(token) as any;
            if (!decoded || !decoded.exp) {
                return null;
            }

            return new Date(decoded.exp * 1000);
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate secure random string for various purposes
     */
    static generateSecureRandom(length: number = 32): string {
        try {
            return crypto.randomBytes(length).toString("hex");
        } catch (error) {
            throw new Error(
                `Failed to generate secure random string: ${error}`
            );
        }
    }

    /**
     * Validate JWT secret configuration
     */
    static validateConfiguration(): void {
        if (
            !process.env.JWT_ACCESS_SECRET ||
            process.env.JWT_ACCESS_SECRET === "your-access-token-secret-key"
        ) {
            console.warn(
                "⚠️  WARNING: Using default JWT secret. Set JWT_ACCESS_SECRET environment variable for production."
            );
        }

        if (
            process.env.JWT_ACCESS_SECRET &&
            process.env.JWT_ACCESS_SECRET.length < 32
        ) {
            console.warn(
                "⚠️  WARNING: JWT secret should be at least 32 characters long for security."
            );
        }
    }
}
