const {InfluxdbClient} = require("../../utils/influxdb");
const config = require("../../config");

const {Agent} = require('http')
const keepAliveAgent = new Agent({
    keepAlive: true,
    keepAliveMsecs: 20 * 10000,
    timeout: 600000,
})
process.on('exit', () => keepAliveAgent.destroy())

const influxdbClient = new InfluxdbClient({
    baseUrl: config.INFLUX_DB.BASE_URL,
    password: config.INFLUX_DB.PASSWORD,
    username: config.INFLUX_DB.USERNAME,
    transportOptions: {
        agent: keepAliveAgent
    },
    timeout: 600000
})

const init = async () => {
    for (let writeApi of Object.values(config.INFLUX_DB.WRITE_API)) {
        await influxdbClient.createWriteApi(writeApi.name, writeApi.org, writeApi.bucket)
    }
    for (let writeApi of Object.values(config.INFLUX_DB.QUERY_API)) {
        await influxdbClient.createQueryApi(writeApi.name, writeApi.org, writeApi.bucket)
    }
};

module.exports = {init, influxdbClient};