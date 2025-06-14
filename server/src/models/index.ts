import { sequelize } from "../config/database";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { Category } from "./Category";
import { Tag } from "./Tag";
import { Todo } from "./Todo";
import { Subtask } from "./Subtask";
import { TodoTag } from "./TodoTag";
import { RefreshToken } from "./RefreshToken";

console.log("Models index file loaded");

// Setup associations
User.hasMany(Category, { foreignKey: "user_id", as: "categories" });
User.hasMany(Tag, { foreignKey: "user_id", as: "tags" });
User.hasMany(Todo, { foreignKey: "user_id", as: "todos" });
User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refreshTokens" });

Category.belongsTo(User, { foreignKey: "user_id", as: "user" });
Category.hasMany(Todo, { foreignKey: "category_id", as: "todos" });

Tag.belongsTo(User, { foreignKey: "user_id", as: "user" });
Tag.belongsToMany(Todo, {
    through: TodoTag,
    foreignKey: "tag_id",
    otherKey: "todo_id",
    as: "todos",
});

Todo.belongsTo(User, { foreignKey: "user_id", as: "user" });
Todo.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Todo.hasMany(Subtask, { foreignKey: "todo_id", as: "subtasks" });
Todo.belongsToMany(Tag, {
    through: TodoTag,
    foreignKey: "todo_id",
    otherKey: "tag_id",
    as: "tags",
});

Subtask.belongsTo(Todo, { foreignKey: "todo_id", as: "todo" });

TodoTag.belongsTo(Todo, { foreignKey: "todo_id", as: "todo" });
TodoTag.belongsTo(Tag, { foreignKey: "tag_id", as: "tag" });

RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });

export {
    sequelize,
    BaseModel,
    User,
    Category,
    Tag,
    Todo,
    Subtask,
    TodoTag,
    RefreshToken,
};
