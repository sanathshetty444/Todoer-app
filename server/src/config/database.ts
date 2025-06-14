import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect: "postgres";
    logging: boolean | ((sql: string) => void);
    pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
    };
}

/**
 * Database Configuration Singleton Class
 * Implements singleton pattern to ensure only one database connection instance
 */
class DatabaseConnection {
    private static instance: DatabaseConnection;
    private sequelize: Sequelize;
    private config: DatabaseConfig;

    private constructor() {
        this.config = this.getConfig();
        this.sequelize = new Sequelize({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            username: this.config.username,
            password: this.config.password,
            dialect: this.config.dialect,
            logging: this.config.logging,
            pool: this.config.pool,
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true,
            },
        });
    }

    /**
     * Get singleton instance of DatabaseConnection
     */
    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    /**
     * Get Sequelize instance
     */
    public getSequelize(): Sequelize {
        return this.sequelize;
    }

    /**
     * Get database configuration
     */
    private getConfig(): DatabaseConfig {
        const environment = process.env.NODE_ENV || "development";

        return {
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "5432"),
            database: process.env.DB_NAME || `idfy_${environment}`,
            username: process.env.DB_USERNAME || "postgres",
            password: process.env.DB_PASSWORD || "password",
            dialect: "postgres",
            logging: environment === "development" ? console.log : false,
            pool: {
                max: parseInt(process.env.DB_POOL_MAX || "5"),
                min: parseInt(process.env.DB_POOL_MIN || "0"),
                acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000"),
                idle: parseInt(process.env.DB_POOL_IDLE || "10000"),
            },
        };
    }

    /**
     * Test database connection
     */
    public async testConnection(): Promise<boolean> {
        try {
            await this.sequelize.authenticate();
            console.log(
                "✅ Database connection has been established successfully."
            );
            return true;
        } catch (error) {
            console.error("❌ Unable to connect to the database:", error);
            return false;
        }
    }

    /**
     * Close database connection
     */
    public async closeConnection(): Promise<void> {
        try {
            await this.sequelize.close();
            console.log("🔒 Database connection closed.");
        } catch (error) {
            console.error("❌ Error closing database connection:", error);
        }
    }

    /**
     * Sync database (for development only)
     */
    public async syncDatabase(force: boolean = false): Promise<void> {
        try {
            await this.sequelize.sync({ force });
            console.log("🔄 Database synchronized successfully.");
        } catch (error) {
            console.error("❌ Error synchronizing database:", error);
            throw error;
        }
    }
}

// Export singleton instance
export const databaseConnection = DatabaseConnection.getInstance();
export const sequelize = databaseConnection.getSequelize();
export default DatabaseConnection;
