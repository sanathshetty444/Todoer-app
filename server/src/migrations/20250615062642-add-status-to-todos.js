"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // First, create the ENUM type
        await queryInterface.sequelize.query(`
            CREATE TYPE "enum_todos_status" AS ENUM (
                'not_started',
                'in_progress', 
                'on_hold',
                'completed'
            );
        `);

        // Add the status column to the todos table
        await queryInterface.addColumn("todos", "status", {
            type: Sequelize.ENUM(
                "not_started",
                "in_progress",
                "on_hold",
                "completed"
            ),
            allowNull: false,
            defaultValue: "not_started",
        });

        // Add index for the new status column
        await queryInterface.addIndex("todos", ["status"]);
    },

    async down(queryInterface, Sequelize) {
        // Remove the index
        await queryInterface.removeIndex("todos", ["status"]);

        // Remove the column
        await queryInterface.removeColumn("todos", "status");

        // Drop the ENUM type
        await queryInterface.sequelize.query(`
            DROP TYPE IF EXISTS "enum_todos_status";
        `);
    },
};
