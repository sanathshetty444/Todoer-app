"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("todos", {
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
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            completed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            favorite: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            sequence: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "categories",
                    key: "id",
                },
                onDelete: "SET NULL",
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
        await queryInterface.addIndex("todos", ["user_id"]);
        await queryInterface.addIndex("todos", ["category_id"]);
        await queryInterface.addIndex("todos", ["completed"]);
        await queryInterface.addIndex("todos", ["favorite"]);
        await queryInterface.addIndex("todos", ["sequence"]);
        await queryInterface.addIndex("todos", ["created_at"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("todos");
    },
};
