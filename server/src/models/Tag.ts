import { DataTypes, ModelAttributes, ForeignKey } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import { User } from "./User";

export interface TagAttributes {
    id?: number;
    name: string;
    user_id: ForeignKey<User["id"]>;
    created_at?: Date;
    updated_at?: Date;
}

export interface TagCreationAttributes
    extends Omit<TagAttributes, "id" | "created_at" | "updated_at"> {}

/**
 * Tag Model
 * Represents todo tags belonging to users
 */
export class Tag extends BaseModel implements TagAttributes {
    public id!: number;
    public name!: string;
    public user_id!: ForeignKey<User["id"]>;

    // Association properties
    // public user?: User;
    // public todos?: Todo[];

    /**
     * Get tags for a specific user
     */
    public static async getByUserId(userId: number): Promise<Tag[]> {
        return Tag.findAll({
            where: { user_id: userId },
            order: [["name", "ASC"]],
        });
    }

    /**
     * Find tag by name for a specific user
     */
    public static async findByNameAndUser(
        name: string,
        userId: number
    ): Promise<Tag | null> {
        return Tag.findOne({
            where: {
                name: name.trim(),
                user_id: userId,
            },
        });
    }

    /**
     * Create tag with validation
     */
    public static async createForUser(
        name: string,
        userId: number
    ): Promise<Tag> {
        const trimmedName = name.trim();

        if (!trimmedName) {
            throw new Error("Tag name cannot be empty");
        }

        // Check if tag already exists for this user
        const existing = await this.findByNameAndUser(trimmedName, userId);
        if (existing) {
            throw new Error("Tag with this name already exists");
        }

        return Tag.create({
            name: trimmedName,
            user_id: userId,
        });
    }

    /**
     * Update tag name with validation
     */
    public async updateName(newName: string): Promise<void> {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            throw new Error("Tag name cannot be empty");
        }

        // Check if another tag with this name exists for the same user
        const existing = await Tag.findByNameAndUser(trimmedName, this.user_id);
        if (existing && existing.id !== this.id) {
            throw new Error("Tag with this name already exists");
        }

        this.name = trimmedName;
        await this.save();
    }

    /**
     * Get tags by IDs for a specific user
     */
    public static async getByIdsAndUser(
        tagIds: number[],
        userId: number
    ): Promise<Tag[]> {
        return Tag.findAll({
            where: {
                id: tagIds,
                user_id: userId,
            },
        });
    }
}

// Define model attributes
const tagAttributes: ModelAttributes = {
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
Tag.initializeModel(Tag, tagAttributes, sequelize, "tags", {
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
            name: "unique_tag_name_per_user",
        },
    ],
});

export default Tag;
