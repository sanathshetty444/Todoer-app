"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash("password123", 12);

        await queryInterface.bulkInsert(
            "users",
            [
                {
                    email: "admin@idfy.com",
                    name: "Admin User",
                    password_hash: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    email: "john.doe@example.com",
                    name: "John Doe",
                    password_hash: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    email: "jane.smith@example.com",
                    name: "Jane Smith",
                    password_hash: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ],
            {}
        );

        // Get user IDs for seeding related data
        const users = await queryInterface.sequelize.query(
            "SELECT id, email FROM users WHERE email IN (?)",
            {
                replacements: [
                    [
                        "admin@idfy.com",
                        "john.doe@example.com",
                        "jane.smith@example.com",
                    ],
                ],
                type: queryInterface.sequelize.QueryTypes.SELECT,
            }
        );

        const adminUser = users.find((u) => u.email === "admin@idfy.com");
        const johnUser = users.find((u) => u.email === "john.doe@example.com");

        if (adminUser) {
            // Create categories for admin user
            await queryInterface.bulkInsert(
                "categories",
                [
                    {
                        name: "Work",
                        user_id: adminUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    {
                        name: "Personal",
                        user_id: adminUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    {
                        name: "Shopping",
                        user_id: adminUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
                {}
            );

            // Create tags for admin user
            await queryInterface.bulkInsert(
                "tags",
                [
                    {
                        name: "urgent",
                        user_id: adminUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    {
                        name: "important",
                        user_id: adminUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    {
                        name: "later",
                        user_id: adminUser.id,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
                {}
            );

            // Get category and tag IDs
            const categories = await queryInterface.sequelize.query(
                "SELECT id, name FROM categories WHERE user_id = ?",
                {
                    replacements: [adminUser.id],
                    type: queryInterface.sequelize.QueryTypes.SELECT,
                }
            );

            const tags = await queryInterface.sequelize.query(
                "SELECT id, name FROM tags WHERE user_id = ?",
                {
                    replacements: [adminUser.id],
                    type: queryInterface.sequelize.QueryTypes.SELECT,
                }
            );

            const workCategory = categories.find((c) => c.name === "Work");
            const personalCategory = categories.find(
                (c) => c.name === "Personal"
            );
            const urgentTag = tags.find((t) => t.name === "urgent");
            const importantTag = tags.find((t) => t.name === "important");

            // Create sample todos
            await queryInterface.bulkInsert(
                "todos",
                [
                    {
                        title: "Complete project documentation",
                        description:
                            "Finish writing the API documentation for the new project",
                        completed: false,
                        favorite: true,
                        sequence: 1,
                        user_id: adminUser.id,
                        category_id: workCategory?.id || null,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    {
                        title: "Buy groceries",
                        description: "Milk, bread, eggs, and vegetables",
                        completed: false,
                        favorite: false,
                        sequence: 2,
                        user_id: adminUser.id,
                        category_id: personalCategory?.id || null,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    {
                        title: "Review pull requests",
                        description: "Review and merge pending pull requests",
                        completed: true,
                        favorite: false,
                        sequence: 3,
                        user_id: adminUser.id,
                        category_id: workCategory?.id || null,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ],
                {}
            );
        }
    },

    async down(queryInterface, Sequelize) {
        const { Op } = require("sequelize");

        // Delete in reverse order due to foreign key constraints
        await queryInterface.bulkDelete("todo_tags", {}, {});
        await queryInterface.bulkDelete("subtasks", {}, {});
        await queryInterface.bulkDelete("todos", {}, {});
        await queryInterface.bulkDelete("categories", {}, {});
        await queryInterface.bulkDelete("tags", {}, {});
        await queryInterface.bulkDelete(
            "users",
            {
                email: {
                    [Op.in]: [
                        "admin@idfy.com",
                        "john.doe@example.com",
                        "jane.smith@example.com",
                    ],
                },
            },
            {}
        );
    },
};
