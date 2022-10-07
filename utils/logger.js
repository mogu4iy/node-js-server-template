const config = require("../config");
const moment = require("moment");
const {InfluxdbClient} = require("./influxdb");
const {Agent} = require("http");

class Logger {
    #name
    #version
    #procid
    #dev
    #influxdbClient
    #influxdbOrganisation
    #influxdbBucket
    #influxdbMeasurement
    #influxdbBaseUrl
    #influxdbPassword
    #influxdbUsername
    #writeApiName = "syslog"

    constructor({name, version, procid, influxdb: {organisation, bucket, measurement, baseUrl, password, username}, dev=false}) {
        this.#name = name
        this.#version = version
        this.#procid = procid
        this.#influxdbOrganisation = organisation
        this.#influxdbBucket = bucket
        this.#influxdbMeasurement = measurement
        this.#influxdbBaseUrl = baseUrl
        this.#influxdbPassword = password
        this.#influxdbUsername = username
        this.#dev = dev
    }

    async createLogger() {
        if (this.#dev){
            return
        }
        const {Agent} = require('http')
        const keepAliveAgent = new Agent({
            keepAlive: false,
            keepAliveMsecs: 20 * 1000,
        })
        process.on('exit', () => keepAliveAgent.destroy())
        this.#influxdbClient = new InfluxdbClient({
            baseUrl: this.#influxdbBaseUrl,
            password: this.#influxdbPassword,
            username: this.#influxdbUsername,
            transportOptions: {
                agent: keepAliveAgent
            },
            timeout: 60000
        })
        await this.#influxdbClient.ping()
        await this.#influxdbClient.createWriteApi(this.#writeApiName, this.#influxdbOrganisation, this.#influxdbBucket)
    }

    async #log({facility, facility_code, severity, severity_code, message}) {
        if (this.#dev){
            console.log(severity, " -- ", message)
            return
        }
        if (typeof message !== "string") {
            message = JSON.stringify(message)
        }
        const timestamp = moment().utc() * 1000000
        const influxdbFieldData = {
            facility_code,
            message: message,
            procid: this.#procid,
            severity_code,
            timestamp,
            version: this.#version
        }
        const influxdbTagData = {
            appname: this.#name,
            facility,
            host: this.#name,
            hostname: this.#name,
            severity
        }
        try {
            await this.#influxdbClient.write({
                apiName: this.#writeApiName,
                measurement: this.#influxdbMeasurement,
                fieldObj: influxdbFieldData,
                tagObj: influxdbTagData,
                timestamp: timestamp
            })
        } catch (e) {
        }
    }

    async emergency(data) {
        const severity = config.LOGGER.SEVERITY.EMERGENCY
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async alert(data) {
        const severity = config.LOGGER.SEVERITY.ALERT
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async critical(data) {
        const severity = config.LOGGER.SEVERITY.CRITICAL
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async error(data) {
        const severity = config.LOGGER.SEVERITY.ERROR
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async warning(data) {
        const severity = config.LOGGER.SEVERITY.WARNING
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async notice(data) {
        const severity = config.LOGGER.SEVERITY.NOTICE
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async info(data) {
        const severity = config.LOGGER.SEVERITY.INFORMATIONAL
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }

    async debug(data) {
        const severity = config.LOGGER.SEVERITY.DEBUG
        const facility = config.LOGGER.FACILITY.ALERT
        await this.#log({
            severity: severity["key"],
            severity_code: severity["code"],
            facility: facility["key"],
            facility_code: facility["code"],
            message: data
        })
    }
}

module.exports = {
    Logger
}