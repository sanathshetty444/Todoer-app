require("dotenv").config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME || "sanath_aspl_12",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "idfy_development",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        migrationStorageTableName: "sequelize_meta",
        seederStorageTableName: "sequelize_data",
    },
    test: {
        username: process.env.DB_USERNAME || "sanath_aspl_12",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "idfy_test",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        migrationStorageTableName: "sequelize_meta",
        seederStorageTableName: "sequelize_data",
    },
    production: {
        username: process.env.DB_USERNAME || "sanath_aspl_12",
        password: process.env.DB_PASSWORD || "",
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
