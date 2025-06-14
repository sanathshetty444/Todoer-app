"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("subtasks", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            title: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    "not_started",
                    "in_progress",
                    "on_hold",
                    "completed"
                ),
                allowNull: false,
                defaultValue: "not_started",
            },
            sequence: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            todo_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "todos",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        // Add indexes
        await queryInterface.addIndex("subtasks", ["todo_id"]);
        await queryInterface.addIndex("subtasks", ["status"]);
        await queryInterface.addIndex("subtasks", ["sequence"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("subtasks");
    },
};
