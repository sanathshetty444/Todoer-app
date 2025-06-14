import { FindOptions, WhereOptions, Op } from "sequelize";
import { BaseDAO } from "./base.dao";
import { User, UserAttributes, UserCreationAttributes } from "../models/User";

/**
 * User DAO
 * Handles all database operations for User entity
 */
export class UserDAO extends BaseDAO<
    User,
    UserAttributes,
    UserCreationAttributes
> {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     */
    async findByEmail(
        email: string,
        options?: FindOptions
    ): Promise<User | null> {
        try {
            return await this.findOne({ email }, options);
        } catch (error) {
            throw new Error(`Failed to find user by email: ${error}`);
        }
    }

    /**
     * Find user by email with password (for authentication)
     */
    async findByEmailWithPassword(email: string): Promise<User | null> {
        try {
            return await this.findOne(
                { email },
                {
                    attributes: {
                        include: ["password_hash"],
                    },
                }
            );
        } catch (error) {
            throw new Error(
                `Failed to find user by email with password: ${error}`
            );
        }
    }

    /**
     * Check if email already exists
     */
    async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
        try {
            const where: WhereOptions<UserAttributes> = { email };

            if (excludeUserId) {
                where.id = { [Op.ne]: excludeUserId };
            }

            return await this.exists(where);
        } catch (error) {
            throw new Error(`Failed to check if email exists: ${error}`);
        }
    }

    /**
     * Create user with hashed password
     */
    async createUser(userData: UserCreationAttributes): Promise<User> {
        try {
            return await this.create(userData);
        } catch (error) {
            throw new Error(`Failed to create user: ${error}`);
        }
    }

    /**
     * Find user with minimal public information
     */
    async findPublicById(id: number): Promise<User | null> {
        try {
            return await this.findById(id, {
                attributes: ["id", "email", "name", "created_at"],
            });
        } catch (error) {
            throw new Error(`Failed to find public user by ID: ${error}`);
        }
    }

    /**
     * Update user's last login timestamp
     */
    async updateLastLogin(userId: number): Promise<void> {
        try {
            await this.updateById(userId, {
                // Note: Add last_login_at field to User model if needed
            } as any);
        } catch (error) {
            throw new Error(`Failed to update last login: ${error}`);
        }
    }

    /**
     * Find active users
     */
    async findActiveUsers(options?: FindOptions): Promise<User[]> {
        try {
            return await this.findAll({
                where: {
                    // Add is_active field if needed
                },
                attributes: ["id", "email", "name", "created_at"],
                ...options,
            });
        } catch (error) {
            throw new Error(`Failed to find active users: ${error}`);
        }
    }
}
