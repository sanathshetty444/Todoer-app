"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("categories", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(255),
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

        // Add unique constraint for name + user_id combination
        await queryInterface.addConstraint("categories", {
            fields: ["name", "user_id"],
            type: "unique",
            name: "unique_category_name_per_user",
        });

        // Add indexes
        await queryInterface.addIndex("categories", ["user_id"]);
        await queryInterface.addIndex("categories", ["name"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("categories");
    },
};
