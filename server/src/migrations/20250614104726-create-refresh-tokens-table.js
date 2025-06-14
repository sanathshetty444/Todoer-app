"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("refresh_tokens", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            token: {
                type: Sequelize.STRING(64),
                allowNull: false,
                unique: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            is_blacklisted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        // Add index for faster lookups
        await queryInterface.addIndex("refresh_tokens", ["token"]);
        await queryInterface.addIndex("refresh_tokens", ["user_id"]);
        await queryInterface.addIndex("refresh_tokens", ["expires_at"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("refresh_tokens");
    },
};
