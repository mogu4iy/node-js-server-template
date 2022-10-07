const dotenv = require("dotenv");
const path = require("path");

const DB = require("./db");
const SERVER = require("./server");
const RABBIT_MQ = require("./rabbit_mq");
const CRON = require("./cron");
const LIB = require("./lib");
const REDIS = require("./redis");
const INFLUX_DB = require("./influx_db");
const LOGGER = require("./logger");
const KAFKA = require("./kafka");

const {validateConfig} = require("../utils/validations");

const SERVER_CONFIG = SERVER()
const RABBIT_MQ_CONFIG = RABBIT_MQ({server_id: SERVER_CONFIG.SERVER.ID})
const KAFKA_CONFIG = KAFKA({server_id: SERVER_CONFIG.SERVER.ID})
const CRON_CONFIG = CRON()
const LIB_CONFIG = LIB()
const REDIS_CONFIG = REDIS()
const INFLUX_DB_CONFIG = INFLUX_DB()
const LOGGER_CONFIG = LOGGER()

const config = {
    ...SERVER_CONFIG,
    ...RABBIT_MQ_CONFIG,
    ...KAFKA_CONFIG,
    ...CRON_CONFIG,
    ...LIB_CONFIG,
    ...REDIS_CONFIG,
    ...INFLUX_DB_CONFIG,
    ...LOGGER_CONFIG,
    DB: DB,
    APP_DIR: path.resolve(__dirname, "../"),
    NODE_ENV: process.env.NODE_ENV,
};

for (let key in config) {
    if (!validateConfig(config[key])) {
        throw new Error(`Config is not valid by ${key}`);
    }
}

module.exports = config;
