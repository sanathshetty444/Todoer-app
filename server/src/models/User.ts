import { DataTypes, ModelAttributes } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import bcrypt from "bcrypt";

export interface UserAttributes {
    id?: number;
    email: string;
    password_hash: string;
    name: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface UserCreationAttributes
    extends Omit<UserAttributes, "id" | "created_at" | "updated_at"> {}

/**
 * User Model
 * Implements user entity with authentication capabilities
 */
export class User extends BaseModel implements UserAttributes {
    public id!: number;
    public email!: string;
    public password_hash!: string;
    public name!: string;

    // Association properties (defined by Sequelize associations)
    public categories?: any[];
    public tags?: any[];
    public todos?: any[];
    public refreshTokens?: any[];

    /**
     * Hash password before saving
     */
    public async setPassword(password: string): Promise<void> {
        const saltRounds = 12;
        this.password_hash = await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verify password
     */
    public async verifyPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password_hash);
    }

    /**
     * Get public fields (exclude sensitive data)
     */
    public getPublicFields(): Partial<UserAttributes> {
        const { password_hash, ...publicFields } = this.toJSON();
        return publicFields;
    }

    /**
     * Static method to find user by email
     */
    public static async findByEmail(email: string): Promise<User | null> {
        return User.findOne({ where: { email: email.toLowerCase() } });
    }

    /**
     * Hook: Hash password before creating user
     */
    public static async beforeCreateHook(user: User): Promise<void> {
        if (user.password_hash && !user.password_hash.startsWith("$2b$")) {
            await user.setPassword(user.password_hash);
        }
        user.email = user.email.toLowerCase();
    }

    /**
     * Hook: Hash password before updating if changed
     */
    public static async beforeUpdateHook(user: User): Promise<void> {
        if (
            user.changed("password_hash") &&
            !user.password_hash.startsWith("$2b$")
        ) {
            await user.setPassword(user.password_hash);
        }
        if (user.changed("email")) {
            user.email = user.email.toLowerCase();
        }
    }
}

// Define model attributes
const userAttributes: ModelAttributes = {
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
};

// Initialize the model
User.initializeModel(User, userAttributes, sequelize, "users", {
    hooks: {
        beforeCreate: User.beforeCreateHook,
        beforeUpdate: User.beforeUpdateHook,
    },
    indexes: [
        {
            unique: true,
            fields: ["email"],
        },
        {
            fields: ["created_at"],
        },
    ],
});

export default User;
