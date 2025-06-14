import { Model, DataTypes, ModelAttributes, Sequelize } from "sequelize";

/**
 * Base Model Class
 * Implements common functionality for all models
 * Follows Active Record pattern with additional utility methods
 */
export abstract class BaseModel extends Model {
    public id!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    /**
     * Initialize the model with common attributes
     */
    public static initializeModel(
        modelClass: any,
        attributes: ModelAttributes,
        sequelize: Sequelize,
        tableName: string,
        options: any = {}
    ): void {
        const defaultAttributes: ModelAttributes = {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            ...attributes,
        };

        const defaultOptions = {
            sequelize,
            tableName,
            timestamps: true,
            underscored: true,
            freezeTableName: true,
            ...options,
        };

        modelClass.init(defaultAttributes, defaultOptions);
    }

    /**
     * Get model instance as JSON with selected fields
     */
    public toJSON(): any {
        const values = super.toJSON();
        // Remove sensitive fields if needed
        return values;
    }

    /**
     * Get public fields (override in child classes)
     */
    public getPublicFields(): any {
        return this.toJSON();
    }

    /**
     * Soft delete implementation (override in child classes if needed)
     */
    public async softDelete(): Promise<void> {
        if ("deletedAt" in this) {
            await this.update({ deletedAt: new Date() } as any);
        } else {
            throw new Error("Soft delete not supported for this model");
        }
    }

    /**
     * Check if record is soft deleted
     */
    public isDeleted(): boolean {
        return "deletedAt" in this && (this as any).deletedAt !== null;
    }
}

export default BaseModel;
