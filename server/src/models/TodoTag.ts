import { DataTypes, ModelAttributes, ForeignKey, QueryTypes } from "sequelize";
import { BaseModel } from "./BaseModel";
import { sequelize } from "../config/database";
import { Todo } from "./Todo";
import { Tag } from "./Tag";

export interface TodoTagAttributes {
    todo_id: ForeignKey<Todo["id"]>;
    tag_id: ForeignKey<Tag["id"]>;
    created_at?: Date;
}

export interface TodoTagCreationAttributes
    extends Omit<TodoTagAttributes, "created_at"> {}

/**
 * TodoTag Model
 * Junction table for many-to-many relationship between todos and tags
 */
export class TodoTag extends BaseModel implements TodoTagAttributes {
    public todo_id!: ForeignKey<Todo["id"]>;
    public tag_id!: ForeignKey<Tag["id"]>;

    // Association properties
    // public todo?: Todo;
    // public tag?: Tag;

    /**
     * Add tag to todo
     */
    public static async addTagToTodo(
        todoId: number,
        tagId: number
    ): Promise<TodoTag> {
        // Check if relationship already exists
        const existing = await TodoTag.findOne({
            where: {
                todo_id: todoId,
                tag_id: tagId,
            },
        });

        if (existing) {
            return existing;
        }

        return TodoTag.create({
            todo_id: todoId,
            tag_id: tagId,
        });
    }

    /**
     * Remove tag from todo
     */
    public static async removeTagFromTodo(
        todoId: number,
        tagId: number
    ): Promise<void> {
        await TodoTag.destroy({
            where: {
                todo_id: todoId,
                tag_id: tagId,
            },
        });
    }

    /**
     * Get all tags for a todo
     */
    public static async getTagsForTodo(todoId: number): Promise<number[]> {
        const todoTags = await TodoTag.findAll({
            where: { todo_id: todoId },
            attributes: ["tag_id"],
        });

        return todoTags.map((tt) => tt.tag_id);
    }

    /**
     * Get all todos for a tag
     */
    public static async getTodosForTag(tagId: number): Promise<number[]> {
        const todoTags = await TodoTag.findAll({
            where: { tag_id: tagId },
            attributes: ["todo_id"],
        });

        return todoTags.map((tt) => tt.todo_id);
    }

    /**
     * Set tags for a todo (replaces all existing tags)
     */
    public static async setTagsForTodo(
        todoId: number,
        tagIds: number[]
    ): Promise<void> {
        const transaction = await sequelize.transaction();

        try {
            // Remove all existing tags for this todo
            await TodoTag.destroy({
                where: { todo_id: todoId },
                transaction,
            });

            // Add new tags
            if (tagIds.length > 0) {
                const todoTags = tagIds.map((tagId) => ({
                    todo_id: todoId,
                    tag_id: tagId,
                }));

                await TodoTag.bulkCreate(todoTags, { transaction });
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Remove all tags from a todo
     */
    public static async removeAllTagsFromTodo(todoId: number): Promise<void> {
        await TodoTag.destroy({
            where: { todo_id: todoId },
        });
    }

    /**
     * Get todos count for each tag
     */
    public static async getTagUsageStats(
        userId: number
    ): Promise<{ tag_id: number; todo_count: number }[]> {
        const result = (await sequelize.query(
            `
      SELECT tt.tag_id, COUNT(tt.todo_id) as todo_count
      FROM todo_tags tt
      INNER JOIN todos t ON tt.todo_id = t.id
      WHERE t.user_id = :userId
      GROUP BY tt.tag_id
      ORDER BY todo_count DESC
      `,
            {
                replacements: { userId },
                type: QueryTypes.SELECT,
            }
        )) as { tag_id: number; todo_count: string }[];

        return result.map((r) => ({
            tag_id: r.tag_id,
            todo_count: parseInt(r.todo_count),
        }));
    }

    /**
     * Get todos that have specific tags
     */
    public static async getTodosByTags(
        tagIds: number[],
        userId: number
    ): Promise<number[]> {
        if (tagIds.length === 0) {
            return [];
        }

        const result = (await sequelize.query(
            `
      SELECT DISTINCT tt.todo_id
      FROM todo_tags tt
      INNER JOIN todos t ON tt.todo_id = t.id
      WHERE tt.tag_id IN (:tagIds) AND t.user_id = :userId
      `,
            {
                replacements: { tagIds, userId },
                type: QueryTypes.SELECT,
            }
        )) as { todo_id: number }[];

        return result.map((r) => r.todo_id);
    }
}

// Define model attributes - No id field for junction table
const todoTagAttributes: ModelAttributes = {
    todo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "todos",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "tags",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
};

// Initialize the model without the standard id field
TodoTag.init(todoTagAttributes, {
    sequelize,
    tableName: "todo_tags",
    timestamps: false, // We only have created_at, not updated_at
    indexes: [
        {
            fields: ["todo_id"],
        },
        {
            fields: ["tag_id"],
        },
        {
            unique: true,
            fields: ["todo_id", "tag_id"],
            name: "todo_tags_pkey",
        },
    ],
});

export default TodoTag;
