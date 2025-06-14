import { DataTypes, ModelAttributes, ForeignKey } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface RefreshTokenAttributes {
    id?: number;
    token: string;
    user_id: ForeignKey<User["id"]>;
    expires_at: Date;
    is_blacklisted?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface RefreshTokenCreationAttributes
    extends Omit<RefreshTokenAttributes, "id" | "created_at" | "updated_at"> {}

/**
 * RefreshToken Model
 * Manages refresh tokens for JWT authentication
 */
export class RefreshToken extends BaseModel implements RefreshTokenAttributes {
    public id!: number;
    public token!: string;
    public user_id!: ForeignKey<User["id"]>;
    public expires_at!: Date;
    public is_blacklisted!: boolean;

    // Association properties
    public user?: User;

    /**
     * Check if refresh token is valid (not expired and not blacklisted)
     */
    public isValid(): boolean {
        return !this.is_blacklisted && new Date() < this.expires_at;
    }

    /**
     * Blacklist this refresh token
     */
    public async blacklist(): Promise<void> {
        this.is_blacklisted = true;
        await this.save();
    }

    /**
     * Check if token is expired
     */
    public isExpired(): boolean {
        return new Date() >= this.expires_at;
    }

    /**
     * Get days until expiration
     */
    public getDaysUntilExpiration(): number {
        const now = new Date();
        const diffTime = this.expires_at.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

const modelAttributes: ModelAttributes<RefreshToken, RefreshTokenAttributes> = {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    token: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_blacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

RefreshToken.initializeModel(
    RefreshToken,
    modelAttributes,
    sequelize,
    "refresh_tokens"
);

export default RefreshToken;
