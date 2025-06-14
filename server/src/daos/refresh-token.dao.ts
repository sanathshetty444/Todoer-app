import { FindOptions, Op } from "sequelize";
import { BaseDAO } from "./base.dao";
import {
    RefreshToken,
    RefreshTokenAttributes,
    RefreshTokenCreationAttributes,
} from "../models/RefreshToken";

/**
 * RefreshToken DAO
 * Handles all database operations for RefreshToken entity
 */
export class RefreshTokenDAO extends BaseDAO<
    RefreshToken,
    RefreshTokenAttributes,
    RefreshTokenCreationAttributes
> {
    constructor() {
        super(RefreshToken);
    }

    /**
     * Find refresh token by token string
     */
    async findByToken(
        token: string,
        options?: FindOptions
    ): Promise<RefreshToken | null> {
        try {
            return await this.findOne({ token }, options);
        } catch (error) {
            throw new Error(`Failed to find refresh token: ${error}`);
        }
    }

    /**
     * Find valid (non-blacklisted, non-expired) refresh token
     */
    async findValidToken(token: string): Promise<RefreshToken | null> {
        try {
            return await this.findOne({
                token,
                is_blacklisted: false,
                expires_at: {
                    [Op.gt]: new Date(),
                },
            });
        } catch (error) {
            throw new Error(`Failed to find valid refresh token: ${error}`);
        }
    }

    /**
     * Find all tokens for a specific user
     */
    async findByUserId(
        userId: number,
        options?: FindOptions
    ): Promise<RefreshToken[]> {
        try {
            return await this.findAll({
                where: { user_id: userId },
                ...options,
            });
        } catch (error) {
            throw new Error(`Failed to find tokens by user ID: ${error}`);
        }
    }

    /**
     * Find all valid tokens for a specific user
     */
    async findValidTokensByUserId(userId: number): Promise<RefreshToken[]> {
        try {
            return await this.findAll({
                where: {
                    user_id: userId,
                    is_blacklisted: false,
                    expires_at: {
                        [Op.gt]: new Date(),
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to find valid tokens by user ID: ${error}`);
        }
    }

    /**
     * Create a new refresh token
     */
    async createToken(
        tokenData: RefreshTokenCreationAttributes
    ): Promise<RefreshToken> {
        try {
            return await this.create(tokenData);
        } catch (error) {
            throw new Error(`Failed to create refresh token: ${error}`);
        }
    }

    /**
     * Blacklist a specific token
     */
    async blacklistToken(token: string): Promise<boolean> {
        try {
            const affectedCount = await this.update(
                { is_blacklisted: true },
                { token }
            );
            return affectedCount > 0;
        } catch (error) {
            throw new Error(`Failed to blacklist token: ${error}`);
        }
    }

    /**
     * Blacklist all tokens for a specific user
     */
    async blacklistAllUserTokens(userId: number): Promise<number> {
        try {
            const affectedCount = await this.update(
                { is_blacklisted: true },
                { user_id: userId, is_blacklisted: false }
            );
            return affectedCount;
        } catch (error) {
            throw new Error(`Failed to blacklist all user tokens: ${error}`);
        }
    }

    /**
     * Delete expired tokens (cleanup job)
     */
    async deleteExpiredTokens(): Promise<number> {
        try {
            return await this.delete({
                expires_at: {
                    [Op.lt]: new Date(),
                },
            });
        } catch (error) {
            throw new Error(`Failed to delete expired tokens: ${error}`);
        }
    }

    /**
     * Delete blacklisted tokens older than specified days
     */
    async deleteOldBlacklistedTokens(daysOld: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            return await this.delete({
                is_blacklisted: true,
                updated_at: {
                    [Op.lt]: cutoffDate,
                },
            });
        } catch (error) {
            throw new Error(
                `Failed to delete old blacklisted tokens: ${error}`
            );
        }
    }

    /**
     * Get token statistics for a user
     */
    async getUserTokenStats(userId: number): Promise<{
        total: number;
        active: number;
        blacklisted: number;
        expired: number;
    }> {
        try {
            const now = new Date();

            const [total, active, blacklisted, expired] = await Promise.all([
                this.count({ user_id: userId }),
                this.count({
                    user_id: userId,
                    is_blacklisted: false,
                    expires_at: { [Op.gt]: now },
                }),
                this.count({
                    user_id: userId,
                    is_blacklisted: true,
                }),
                this.count({
                    user_id: userId,
                    expires_at: { [Op.lte]: now },
                }),
            ]);

            return { total, active, blacklisted, expired };
        } catch (error) {
            throw new Error(`Failed to get user token stats: ${error}`);
        }
    }
}
