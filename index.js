const config = require("./config")
const db = require("./db/models");

const {init: initLogger, logger} = require("./services/logger")
const {init: initStore} = require("./services/store")
const {init: initServer} = require("./services/server")
const {init: initWss} = require("./services/ws_server")
const {init: initCron} = require("./services/cron")
const {init: initRabbitMq} = require("./services/rabbitmq")
const {init: initInfluxdb} = require("./services/influxdb")
const {init: initKafka} = require("./services/kafka")
const {init: initRedis} = require("./services/redis")

async function start() {
    try {
        await db.sequelize.authenticate()
        await initLogger()
        await initServer()
        await initInfluxdb()
        await initStore()
        await initRedis()
        await initRabbitMq()
        await initKafka()
        await initWss()
        await initCron()
        await logger.debug(`APP is initialized.`)
        config.SERVER.HEALTH = true
    } catch (e) {
        await initLogger()
        await logger.critical(e)
        process.exit(0)
    }
}

start()
