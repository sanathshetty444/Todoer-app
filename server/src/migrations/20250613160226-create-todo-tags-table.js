"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("todo_tags", {
            todo_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "todos",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            tag_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "tags",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        // Add composite primary key
        await queryInterface.addConstraint("todo_tags", {
            fields: ["todo_id", "tag_id"],
            type: "primary key",
            name: "todo_tags_pkey",
        });

        // Add indexes
        await queryInterface.addIndex("todo_tags", ["todo_id"]);
        await queryInterface.addIndex("todo_tags", ["tag_id"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("todo_tags");
    },
};
