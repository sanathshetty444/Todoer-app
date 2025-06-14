import { DataTypes, ModelAttributes, ForeignKey } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import { Todo } from "./Todo";

export interface SubtaskAttributes {
    id?: number;
    title: string;
    status: "not_started" | "in_progress" | "on_hold" | "completed";
    sequence: number;
    todo_id: ForeignKey<Todo["id"]>;
    created_at?: Date;
    updated_at?: Date;
}

export interface SubtaskCreationAttributes
    extends Omit<SubtaskAttributes, "id" | "created_at" | "updated_at"> {}

/**
 * Subtask Model
 * Represents subtasks belonging to todos
 */
export class Subtask extends BaseModel implements SubtaskAttributes {
    public id!: number;
    public title!: string;
    public status!: "not_started" | "in_progress" | "on_hold" | "completed";
    public sequence!: number;
    public todo_id!: ForeignKey<Todo["id"]>;

    // Association properties
    // public todo?: Todo;

    /**
     * Get subtasks for a specific todo
     */
    public static async getByTodoId(todoId: number): Promise<Subtask[]> {
        return Subtask.findAll({
            where: { todo_id: todoId },
            order: [["sequence", "ASC"]],
        });
    }

    /**
     * Create subtask with auto-sequence
     */
    public static async createForTodo(
        subtaskData: SubtaskCreationAttributes
    ): Promise<Subtask> {
        const trimmedTitle = subtaskData.title.trim();

        if (!trimmedTitle) {
            throw new Error("Subtask title cannot be empty");
        }

        // Get next sequence number for this todo
        const maxSequence = (await Subtask.max("sequence", {
            where: { todo_id: subtaskData.todo_id },
        })) as number;

        return Subtask.create({
            ...subtaskData,
            title: trimmedTitle,
            sequence: (maxSequence || 0) + 1,
            status: subtaskData.status || "not_started",
        });
    }

    /**
     * Update status
     */
    public async updateStatus(
        newStatus: "not_started" | "in_progress" | "on_hold" | "completed"
    ): Promise<void> {
        this.status = newStatus;
        await this.save();
    }

    /**
     * Toggle completion status (backward compatibility)
     */
    public async toggleCompleted(): Promise<void> {
        this.status = this.status === "completed" ? "not_started" : "completed";
        await this.save();
    }

    /**
     * Update title with validation
     */
    public async updateTitle(newTitle: string): Promise<void> {
        const trimmedTitle = newTitle.trim();

        if (!trimmedTitle) {
            throw new Error("Subtask title cannot be empty");
        }

        this.title = trimmedTitle;
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
     * Bulk update sequences for reordering
     */
    public static async updateSequences(
        subtaskSequences: { id: number; sequence: number }[],
        todoId: number
    ): Promise<void> {
        const transaction = await sequelize.transaction();

        try {
            for (const { id, sequence } of subtaskSequences) {
                await Subtask.update(
                    { sequence },
                    {
                        where: { id, todo_id: todoId },
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

    /**
     * Get completion statistics for a todo
     */
    public static async getCompletionStats(
        todoId: number
    ): Promise<{ total: number; completed: number; percentage: number }> {
        const total = await Subtask.count({
            where: { todo_id: todoId },
        });

        const completed = await Subtask.count({
            where: {
                todo_id: todoId,
                status: "completed",
            },
        });

        const percentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, percentage };
    }

    /**
     * Mark all subtasks as completed/uncompleted
     */
    public static async toggleAllForTodo(
        todoId: number,
        status: "not_started" | "in_progress" | "on_hold" | "completed"
    ): Promise<void> {
        await Subtask.update({ status }, { where: { todo_id: todoId } });
    }
}

// Define model attributes
const subtaskAttributes: ModelAttributes = {
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    status: {
        type: DataTypes.ENUM(
            "not_started",
            "in_progress",
            "on_hold",
            "completed"
        ),
        allowNull: false,
        defaultValue: "not_started",
    },
    sequence: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    todo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "todos",
            key: "id",
        },
        onDelete: "CASCADE",
    },
};

// Initialize the model
Subtask.initializeModel(Subtask, subtaskAttributes, sequelize, "subtasks", {
    indexes: [
        {
            fields: ["todo_id"],
        },
        {
            fields: ["status"],
        },
        {
            fields: ["sequence"],
        },
    ],
});

export default Subtask;
