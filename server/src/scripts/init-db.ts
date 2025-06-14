#!/usr/bin/env ts-node

/**
 * Database Initialization Script
 * Sets up the database, runs migrations, and optionally seeds data
 */

import { databaseConnection } from "../config/database";
import { sequelize } from "../models";

async function initializeDatabase() {
    try {
        console.log("🚀 Starting database initialization...");

        // Test database connection
        const isConnected = await databaseConnection.testConnection();
        if (!isConnected) {
            throw new Error("Failed to connect to database");
        }

        // Sync models (use with caution in production)
        if (process.env.NODE_ENV === "development") {
            console.log("🔄 Synchronizing models...");
            await sequelize.sync({ force: false }); // Set to true to force recreate tables
        }

        console.log("✅ Database initialization completed successfully!");

        // Instructions for running migrations and seeds
        console.log("\n📋 Next steps:");
        console.log("1. Run migrations: npm run db:migrate");
        console.log("2. Seed data (optional): npm run db:seed");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        process.exit(1);
    } finally {
        await databaseConnection.closeConnection();
    }
}

// Run if this script is executed directly
if (require.main === module) {
    initializeDatabase();
}

export default initializeDatabase;
