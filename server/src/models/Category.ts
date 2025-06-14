import { DataTypes, ModelAttributes, ForeignKey } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface CategoryAttributes {
    id?: number;
    name: string;
    user_id: ForeignKey<User["id"]>;
    created_at?: Date;
    updated_at?: Date;
}

export interface CategoryCreationAttributes
    extends Omit<CategoryAttributes, "id" | "created_at" | "updated_at"> {}

/**
 * Category Model
 * Represents todo categories belonging to users
 */
export class Category extends BaseModel implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public user_id!: ForeignKey<User["id"]>;

    // Association properties
    // public user?: User;
    // public todos?: Todo[];

    /**
     * Get categories for a specific user
     */
    public static async getByUserId(userId: number): Promise<Category[]> {
        return Category.findAll({
            where: { user_id: userId },
            order: [["name", "ASC"]],
        });
    }

    /**
     * Find category by name for a specific user
     */
    public static async findByNameAndUser(
        name: string,
        userId: number
    ): Promise<Category | null> {
        return Category.findOne({
            where: {
                name: name.trim(),
                user_id: userId,
            },
        });
    }

    /**
     * Create category with validation
     */
    public static async createForUser(
        name: string,
        userId: number
    ): Promise<Category> {
        const trimmedName = name.trim();

        if (!trimmedName) {
            throw new Error("Category name cannot be empty");
        }

        // Check if category already exists for this user
        const existing = await this.findByNameAndUser(trimmedName, userId);
        if (existing) {
            throw new Error("Category with this name already exists");
        }

        return Category.create({
            name: trimmedName,
            user_id: userId,
        });
    }

    /**
     * Update category name with validation
     */
    public async updateName(newName: string): Promise<void> {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            throw new Error("Category name cannot be empty");
        }

        // Check if another category with this name exists for the same user
        const existing = await Category.findByNameAndUser(
            trimmedName,
            this.user_id
        );
        if (existing && existing.id !== this.id) {
            throw new Error("Category with this name already exists");
        }

        this.name = trimmedName;
        await this.save();
    }
}

// Define model attributes
const categoryAttributes: ModelAttributes = {
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255],
        },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
};

// Initialize the model
Category.initializeModel(
    Category,
    categoryAttributes,
    sequelize,
    "categories",
    {
        indexes: [
            {
                fields: ["user_id"],
            },
            {
                fields: ["name"],
            },
            {
                unique: true,
                fields: ["name", "user_id"],
                name: "unique_category_name_per_user",
            },
        ],
    }
);

export default Category;
