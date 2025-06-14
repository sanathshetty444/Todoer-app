#!/usr/bin/env ts-node

/**
 * Test script to validate models and associations
 */

import { databaseConnection } from "./config/database";
import { User, Category, Tag, Todo, Subtask } from "./models";

async function testModelsAndAssociations() {
    try {
        // Test database connection
        console.log("🔍 Testing database connection...");
        await databaseConnection.testConnection();
        console.log("✅ Database connection successful");

        // Test User model and associations
        console.log("\n🔍 Testing User model and associations...");
        const user = await User.findOne({
            where: { email: "admin@idfy.com" },
            include: [
                { association: "categories" },
                { association: "tags" },
                {
                    association: "todos",
                    include: [
                        { association: "category" },
                        { association: "tags" },
                        { association: "subtasks" },
                    ],
                },
            ],
        });

        if (user) {
            console.log(`✅ Found user: ${user.name} (${user.email})`);
            console.log(`📊 Categories: ${user.categories?.length || 0}`);
            console.log(`🏷️  Tags: ${user.tags?.length || 0}`);
            console.log(`📋 Todos: ${user.todos?.length || 0}`);

            // Show todos with their relationships
            if (user.todos && user.todos.length > 0) {
                console.log("\n📝 Todo Details:");
                user.todos.forEach((todo: any, index: number) => {
                    console.log(`  ${index + 1}. ${todo.title}`);
                    console.log(
                        `     Category: ${todo.category?.name || "None"}`
                    );
                    console.log(
                        `     Tags: ${
                            todo.tags?.map((tag: any) => tag.name).join(", ") ||
                            "None"
                        }`
                    );
                    console.log(`     Subtasks: ${todo.subtasks?.length || 0}`);
                    console.log(
                        `     Completed: ${todo.completed ? "✅" : "❌"}`
                    );
                    console.log(
                        `     Favorite: ${todo.favorite ? "⭐" : "📄"}`
                    );
                });
            }
        } else {
            console.log("❌ No user found");
        }

        // Test Category model
        console.log("\n🔍 Testing Category model...");
        const categories = await Category.findAll({
            include: [{ association: "todos" }],
        });
        console.log(`✅ Found ${categories.length} categories`);
        categories.forEach((category: any) => {
            console.log(
                `  📁 ${category.name}: ${category.todos?.length || 0} todos`
            );
        });

        // Test Tag model
        console.log("\n🔍 Testing Tag model...");
        const tags = await Tag.findAll({
            include: [{ association: "todos" }],
        });
        console.log(`✅ Found ${tags.length} tags`);
        tags.forEach((tag: any) => {
            console.log(`  🏷️  ${tag.name}: ${tag.todos?.length || 0} todos`);
        });

        // Test database statistics
        console.log("\n📊 Database Statistics:");
        const userCount = await User.count();
        const categoryCount = await Category.count();
        const tagCount = await Tag.count();
        const todoCount = await Todo.count();
        const subtaskCount = await Subtask.count();

        console.log(`👥 Users: ${userCount}`);
        console.log(`📁 Categories: ${categoryCount}`);
        console.log(`🏷️  Tags: ${tagCount}`);
        console.log(`📋 Todos: ${todoCount}`);
        console.log(`📝 Subtasks: ${subtaskCount}`);

        console.log("\n🎉 All model tests completed successfully!");
    } catch (error) {
        console.error("❌ Error during model testing:", error);
    } finally {
        // Close database connection
        await databaseConnection.closeConnection();
        process.exit(0);
    }
}

// Run the test
testModelsAndAssociations().catch(console.error);
