const moment = require("moment");
const config = require("../config")
const {logger} = require("../services/logger");

const wsHandler = (...callbackList) => {
    callbackList = callbackList.reverse()
    const cb = callbackList.reduce((prev, callback) => {
        return async (hData, context, ws, ws_server) => {
            return await callback(hData, context, ws, ws_server, async () => await prev(hData, context))
        }
    }, () => {
    })
    return async (data, context, ws, ws_server) => {
        try {
            return await cb(data, context, ws, ws_server)
        } catch (e) {
            logger.error(e)
        }
    }
};

const configureResponseMessage = ({method = "", data = {}, message = "", meta, error = false}) => {
    return JSON.stringify({
        method: method,
        meta: {
            ...meta,
            message: message,
            success: !error,
            eTime: moment()
        },
        data: data
    })
}

const configureDataMessage = ({method = "", data = {}, meta = {}}) => {
    return JSON.stringify({
        method: method,
        meta: {
            ...meta,
            eTime: moment()
        },
        data: data
    })
}

const configurePingMessage = () => {
    return JSON.stringify({
        method: config.LIB.WS_METHOD.PING,
    })
}

module.exports = {
    wsHandler,
    configureResponseMessage,
    configureDataMessage,
    configurePingMessage,
}