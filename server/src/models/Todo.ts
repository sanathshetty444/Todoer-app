import { DataTypes, ModelAttributes, ForeignKey } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import { User } from "./User";
import { Category } from "./Category";

export interface TodoAttributes {
    id?: number;
    title: string;
    description?: string;
    completed: boolean;
    favorite: boolean;
    sequence: number;
    user_id: ForeignKey<User["id"]>;
    category_id?: ForeignKey<Category["id"]>;
    created_at?: Date;
    updated_at?: Date;
}

export interface TodoCreationAttributes
    extends Omit<TodoAttributes, "id" | "created_at" | "updated_at"> {}

/**
 * Todo Model
 * Main entity representing todo items
 */
export class Todo extends BaseModel implements TodoAttributes {
    public id!: number;
    public title!: string;
    public description?: string;
    public completed!: boolean;
    public favorite!: boolean;
    public sequence!: number;
    public user_id!: ForeignKey<User["id"]>;
    public category_id?: ForeignKey<Category["id"]>;

    // Association properties
    // public user?: User;
    // public category?: Category;
    // public subtasks?: Subtask[];
    // public tags?: Tag[];

    /**
     * Get todos for a specific user
     */
    public static async getByUserId(
        userId: number,
        options: {
            completed?: boolean;
            favorite?: boolean;
            categoryId?: number;
        } = {}
    ): Promise<Todo[]> {
        const where: any = { user_id: userId };

        if (options.completed !== undefined) {
            where.completed = options.completed;
        }

        if (options.favorite !== undefined) {
            where.favorite = options.favorite;
        }

        if (options.categoryId !== undefined) {
            where.category_id = options.categoryId;
        }

        return Todo.findAll({
            where,
            order: [
                ["sequence", "ASC"],
                ["created_at", "DESC"],
            ],
        });
    }

    /**
     * Create todo with auto-sequence
     */
    public static async createForUser(
        todoData: TodoCreationAttributes
    ): Promise<Todo> {
        const trimmedTitle = todoData.title.trim();

        if (!trimmedTitle) {
            throw new Error("Todo title cannot be empty");
        }

        // Get next sequence number for this user
        const maxSequence = (await Todo.max("sequence", {
            where: { user_id: todoData.user_id },
        })) as number;

        return Todo.create({
            ...todoData,
            title: trimmedTitle,
            sequence: (maxSequence || 0) + 1,
            completed: todoData.completed || false,
            favorite: todoData.favorite || false,
        });
    }

    /**
     * Toggle completion status
     */
    public async toggleCompleted(): Promise<void> {
        this.completed = !this.completed;
        await this.save();
    }

    /**
     * Toggle favorite status
     */
    public async toggleFavorite(): Promise<void> {
        this.favorite = !this.favorite;
        await this.save();
    }

    /**
     * Update sequence (for reordering)
     */
    public async updateSequence(newSequence: number): Promise<void> {
        this.sequence = newSequence;
        await this.save();
    }

    /**
     * Update title with validation
     */
    public async updateTitle(newTitle: string): Promise<void> {
        const trimmedTitle = newTitle.trim();

        if (!trimmedTitle) {
            throw new Error("Todo title cannot be empty");
        }

        this.title = trimmedTitle;
        await this.save();
    }

    /**
     * Get todos by category
     */
    public static async getByCategoryId(
        categoryId: number,
        userId: number
    ): Promise<Todo[]> {
        return Todo.findAll({
            where: {
                category_id: categoryId,
                user_id: userId,
            },
            order: [["sequence", "ASC"]],
        });
    }

    /**
     * Get uncategorized todos
     */
    public static async getUncategorized(userId: number): Promise<Todo[]> {
        return Todo.findAll({
            where: {
                category_id: null,
                user_id: userId,
            },
            order: [["sequence", "ASC"]],
        });
    }

    /**
     * Bulk update sequences for reordering
     */
    public static async updateSequences(
        todoSequences: { id: number; sequence: number }[],
        userId: number
    ): Promise<void> {
        const transaction = await sequelize.transaction();

        try {
            for (const { id, sequence } of todoSequences) {
                await Todo.update(
                    { sequence },
                    {
                        where: { id, user_id: userId },
                        transaction,
                    }
                );
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

// Define model attributes
const todoAttributes: ModelAttributes = {
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    sequence: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
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
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "categories",
            key: "id",
        },
        onDelete: "SET NULL",
    },
};

// Initialize the model
Todo.initializeModel(Todo, todoAttributes, sequelize, "todos", {
    indexes: [
        {
            fields: ["user_id"],
        },
        {
            fields: ["category_id"],
        },
        {
            fields: ["completed"],
        },
        {
            fields: ["favorite"],
        },
        {
            fields: ["sequence"],
        },
        {
            fields: ["created_at"],
        },
    ],
});

export default Todo;
