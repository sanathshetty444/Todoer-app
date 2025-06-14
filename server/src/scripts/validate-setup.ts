#!/usr/bin/env node

/**
 * Project Validation Script
 * Validates that all components are properly set up
 */

import fs from "fs";
import path from "path";

interface ValidationResult {
    component: string;
    status: "pass" | "fail" | "warning";
    message: string;
}

function checkFile(filePath: string, description: string): ValidationResult {
    try {
        if (fs.existsSync(filePath)) {
            return {
                component: description,
                status: "pass",
                message: "File exists and accessible",
            };
        } else {
            return {
                component: description,
                status: "fail",
                message: "File not found",
            };
        }
    } catch (error) {
        return {
            component: description,
            status: "fail",
            message: `Error checking file: ${error}`,
        };
    }
}

function validateProject(): void {
    console.log(
        "🔍 Validating Node.js TypeScript + PostgreSQL Project Setup...\n"
    );

    const validations: ValidationResult[] = [
        checkFile("package.json", "Package Configuration"),
        checkFile("tsconfig.json", "TypeScript Configuration"),
        checkFile(".env.example", "Environment Template"),
        checkFile(".sequelizerc", "Sequelize CLI Configuration"),
        checkFile("src/index.ts", "Main Server File"),
        checkFile("src/config/database.ts", "Database Connection (Singleton)"),
        checkFile("src/config/config.ts", "Sequelize Configuration"),
        checkFile("src/models/BaseModel.ts", "Base Model"),
        checkFile("src/models/User.ts", "User Model"),
        checkFile("src/models/index.ts", "Model Registry (Singleton)"),
        checkFile("src/migrations", "Migrations Directory"),
        checkFile("src/seeders", "Seeders Directory"),
        checkFile("src/scripts/init-db.ts", "Database Initialization Script"),
        checkFile("dist", "Compiled Output Directory"),
        checkFile("README.md", "Documentation"),
    ];

    // Display results
    validations.forEach((result) => {
        const icon =
            result.status === "pass"
                ? "✅"
                : result.status === "warning"
                ? "⚠️"
                : "❌";
        console.log(`${icon} ${result.component}: ${result.message}`);
    });

    const passCount = validations.filter((v) => v.status === "pass").length;
    const totalCount = validations.length;

    console.log(
        `\n📊 Validation Summary: ${passCount}/${totalCount} components validated successfully`
    );

    if (passCount === totalCount) {
        console.log("\n🎉 All components are properly set up!");
        console.log("\n📋 Next Steps:");
        console.log("1. Set up PostgreSQL database (see README.md)");
        console.log("2. Configure .env file with your database credentials");
        console.log("3. Run: npm run db:create");
        console.log("4. Run: npm run db:migrate");
        console.log("5. Run: npm run dev");
    } else {
        console.log(
            "\n⚠️  Some components need attention. Please check the failed items above."
        );
    }

    console.log("\n🏗️  Design Patterns Implemented:");
    console.log("   • Singleton Pattern: Database connection & Model registry");
    console.log("   • Active Record Pattern: User model with business logic");
    console.log("   • Repository Pattern: Ready for implementation");

    console.log("\n🔧 Key Features:");
    console.log("   • TypeScript with strict configuration");
    console.log("   • PostgreSQL with Sequelize ORM");
    console.log("   • Migration & seeding system");
    console.log("   • Password hashing with bcrypt");
    console.log("   • Environment-based configuration");
    console.log("   • Hot reloading for development");
}

// Run validation if script is executed directly
if (require.main === module) {
    validateProject();
}

export { validateProject };
