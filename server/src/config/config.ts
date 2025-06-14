import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface SequelizeConfig {
    development: {
        username: string;
        password: string;
        database: string;
        host: string;
        port: number;
        dialect: "postgres";
        migrationStorageTableName: string;
        seederStorageTableName: string;
    };
    test: {
        username: string;
        password: string;
        database: string;
        host: string;
        port: number;
        dialect: "postgres";
        migrationStorageTableName: string;
        seederStorageTableName: string;
    };
    production: {
        username: string;
        password: string;
        database: string;
        host: string;
        port: number;
        dialect: "postgres";
        migrationStorageTableName: string;
        seederStorageTableName: string;
        logging: boolean;
        pool: {
            max: number;
            min: number;
            acquire: number;
            idle: number;
        };
    };
}

const config: SequelizeConfig = {
    development: {
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "idfy_development",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        migrationStorageTableName: "sequelize_meta",
        seederStorageTableName: "sequelize_data",
    },
    test: {
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "idfy_test",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        migrationStorageTableName: "sequelize_meta",
        seederStorageTableName: "sequelize_data",
    },
    production: {
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "idfy_production",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        migrationStorageTableName: "sequelize_meta",
        seederStorageTableName: "sequelize_data",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
};

export = config;
