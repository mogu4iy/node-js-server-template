const dotenv = require("dotenv");
const path = require("path");

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'production'
if (!NODE_ENV.includes("docker")) {
    const ENV_FILE = ".env"
    const resultEnv = dotenv.config({path: path.resolve(__dirname, `../${ENV_FILE}`)});
    if (resultEnv.error) {
    }
}

for (let env of ["development", "production"]) {
    if (process.env.NODE_ENV.includes(env)) {
        process.env.NODE_ENV = env
        break
    }
}

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_CONNECTION,
        // ssl: true,
        // dialectOptions: {
        //     ssl: {
        //         require: true,
        //         rejectUnauthorized: false,
        //     }
        // },
        pool: {
            max: 5,
            min: 0,
            acquire: 1000000,
            idle: 100000
        },
        migrationStorageTableName: "sequelize_meta"
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_CONNECTION,
        // ssl: true,
        // dialectOptions: {
        //     ssl: {
        //         require: true,
        //         rejectUnauthorized: false,
        //     }
        // },
        pool: {
            max: 5,
            min: 0,
            acquire: 1000000,
            idle: 100000
        },
        migrationStorageTableName: "sequelize_meta"
    }
};