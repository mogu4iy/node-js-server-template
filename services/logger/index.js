const {Logger} = require("../../utils/logger");
const config = require("../../config");

const logger = new Logger({
    name: config.SERVER.APP_NAME,
    version: config.SERVER.APP_VERSION,
    procid: config.SERVER.PID,
    influxdb: {
        baseUrl: config.INFLUX_DB.BASE_URL,
        organisation: config.INFLUX_DB.WRITE_API.GRAFANA.org,
        bucket: config.INFLUX_DB.WRITE_API.GRAFANA.bucket,
        measurement: config.INFLUX_DB.MEASUREMENT.SYSLOG,
        password: config.INFLUX_DB.PASSWORD,
        username: config.INFLUX_DB.USERNAME
    },
    dev: config.NODE_ENV.includes(config.LIB.NODE_ENV.DEV)
})

const init = async () => {
    await logger.createLogger()
};

module.exports = {init, logger};