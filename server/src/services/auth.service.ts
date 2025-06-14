import bcrypt from "bcrypt";
import { UserDAO } from "../daos/user.dao";
import { RefreshTokenDAO } from "../daos/refresh-token.dao";
import { TokenUtils, JWTPayload, TokenPair } from "../utils/token.utils";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";

export interface RegisterData {
    email: string;
    name: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResult {
    user: {
        id: number;
        email: string;
        name: string;
    };
    tokens: TokenPair;
}

/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 * Follows CQRS pattern with separated command and query operations
 */
export class AuthService {
    private userDAO: UserDAO;
    private refreshTokenDAO: RefreshTokenDAO;

    constructor() {
        this.userDAO = new UserDAO();
        this.refreshTokenDAO = new RefreshTokenDAO();
    }

    /**
     * Register a new user
     */
    async register(registerData: RegisterData): Promise<AuthResult> {
        try {
            // Check if user already exists
            const existingUser = await this.userDAO.findByEmail(
                registerData.email
            );
            if (existingUser) {
                throw new Error("User with this email already exists");
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(
                registerData.password,
                saltRounds
            );

            // Create user
            const user = await this.userDAO.createUser({
                email: registerData.email,
                name: registerData.name,
                password_hash: hashedPassword,
            });

            // Generate tokens
            const tokens = await this.generateTokenPair(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                tokens,
            };
        } catch (error) {
            throw new Error(
                `Registration failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Login user with email and password
     */
    async login(loginData: LoginData): Promise<AuthResult> {
        try {
            // Find user with password
            const user = await this.userDAO.findByEmailWithPassword(
                loginData.email
            );
            if (!user) {
                throw new Error("Invalid email or password");
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(
                loginData.password,
                user.password_hash
            );
            if (!isValidPassword) {
                throw new Error("Invalid email or password");
            }

            // Update last login (if you have this field in your User model)
            await this.userDAO.updateLastLogin(user.id);

            // Generate tokens
            const tokens = await this.generateTokenPair(user);

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                tokens,
            };
        } catch (error) {
            throw new Error(
                `Login failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken(
        refreshToken: string
    ): Promise<{ accessToken: string }> {
        try {
            // Find and validate refresh token
            const tokenRecord = await this.refreshTokenDAO.findValidToken(
                refreshToken
            );
            if (!tokenRecord) {
                throw new Error("Invalid or expired refresh token");
            }

            // Get user
            const user = await this.userDAO.findById(tokenRecord.user_id);
            if (!user) {
                throw new Error("User not found");
            }

            // Generate new access token
            const accessToken = TokenUtils.generateAccessToken({
                userId: user.id,
                email: user.email,
                name: user.name,
            });

            return { accessToken };
        } catch (error) {
            throw new Error(
                `Token refresh failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Logout user by blacklisting refresh token
     */
    async logout(refreshToken: string): Promise<void> {
        try {
            const tokenRecord = await this.refreshTokenDAO.findByToken(
                refreshToken
            );
            if (tokenRecord) {
                await this.refreshTokenDAO.blacklistToken(refreshToken);
            }
            // If token doesn't exist, consider logout successful (idempotent)
        } catch (error) {
            throw new Error(
                `Logout failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Logout user from all devices by blacklisting all refresh tokens
     */
    async logoutAllDevices(userId: number): Promise<void> {
        try {
            await this.refreshTokenDAO.blacklistAllUserTokens(userId);
        } catch (error) {
            throw new Error(
                `Logout all devices failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Blacklist a specific refresh token
     */
    async blacklistToken(refreshToken: string): Promise<void> {
        try {
            const success = await this.refreshTokenDAO.blacklistToken(
                refreshToken
            );
            if (!success) {
                throw new Error("Token not found");
            }
        } catch (error) {
            throw new Error(
                `Token blacklist failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Verify if refresh token is valid
     */
    async verifyRefreshToken(
        refreshToken: string
    ): Promise<RefreshToken | null> {
        try {
            return await this.refreshTokenDAO.findValidToken(refreshToken);
        } catch (error) {
            throw new Error(
                `Token verification failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Get user's active sessions (valid refresh tokens)
     */
    async getUserActiveSessions(userId: number): Promise<RefreshToken[]> {
        try {
            return await this.refreshTokenDAO.findValidTokensByUserId(userId);
        } catch (error) {
            throw new Error(
                `Failed to get user sessions: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Clean up expired tokens (should be run periodically)
     */
    async cleanupExpiredTokens(): Promise<number> {
        try {
            return await this.refreshTokenDAO.deleteExpiredTokens();
        } catch (error) {
            throw new Error(
                `Token cleanup failed: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Generate access and refresh token pair
     */
    private async generateTokenPair(user: User): Promise<TokenPair> {
        try {
            // Generate access token
            const accessToken = TokenUtils.generateAccessToken({
                userId: user.id,
                email: user.email,
                name: user.name,
            });

            // Generate refresh token
            const refreshTokenString = TokenUtils.generateRefreshToken();
            const expiresAt = TokenUtils.getRefreshTokenExpiry();

            // Save refresh token to database
            await this.refreshTokenDAO.createToken({
                token: refreshTokenString,
                user_id: user.id,
                expires_at: expiresAt,
            });

            return {
                accessToken,
                refreshToken: refreshTokenString,
            };
        } catch (error) {
            throw new Error(
                `Failed to generate token pair: ${
                    error instanceof Error ? error.message : error
                }`
            );
        }
    }

    /**
     * Validate password strength
     */
    static validatePassword(password: string): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }

        if (!/[A-Z]/.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        }

        if (!/[a-z]/.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        }

        if (!/\d/.test(password)) {
            errors.push("Password must contain at least one number");
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("Password must contain at least one special character");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Validate email format
     */
    static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
