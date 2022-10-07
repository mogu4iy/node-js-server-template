const config = require("../config")
const {logger} = require("../services/logger");
const {configureResponseMessage} = require("./ws_server");

class Error400 extends Error {
    constructor(message) {
        super(message)
        this.status = 400
    }
}

class Error401 extends Error {
    constructor(message) {
        super(message)
        this.status = 401
    }
}

class Error403 extends Error {
    constructor(message) {
        super(message)
        this.status = 403
    }
}

class Error404 extends Error {
    constructor(message) {
        super(message)
        this.status = 404
    }
}

class Error500 extends Error {
    constructor(message) {
        super(message)
        this.status = 500
    }
}

class CustomError extends Error {
    constructor(message) {
        super(message)
        this.custom = true
    }
}

const wsHandleError = ({error,  ws, method}) => {
    logger.error(error)
    return error.custom ? (
        ws.send(configureResponseMessage({
            method: method,
            error: true,
            message: error,
        }))
    ) : (
        config.NODE_ENV.includes(config.LIB.NODE_ENV.PROD) ? (
            ws.send(configureResponseMessage({
                method: method,
                error: true,
                message: config.LIB.RESPONSE_MESSAGE.SERVER_ERROR(),
            }))
        ) : (
            ws.send(configureResponseMessage({
                method: method,
                error: true,
                message: error,
            }))
        )
    )
}

const wsHandlerWrapper = ({dataFunction, promiseHandler}) => {
    return async (data, context, ws, ws_server, next) => {
        let promiseData
        try {
            promiseData = dataFunction(data, context, ws, ws_server)
        } catch (e) {
            return wsHandleError({
                error: e,
                ws: ws,
                method: context.method,
            })
        }
        return await promiseHandler(promiseData, context, ws, ws_server, next)
            .catch(error => {
                return wsHandleError({
                    error: error,
                    ws: ws,
                    method: context.method,
                })
            })
    }
}

const httpHandleError = ({error, res}) => {
    logger.error(error)
    return error.status ? (
        res.status(200).json({
            success: false,
            data: {},
            message: error.message,
        })
    ) : (
        config.NODE_ENV.includes(config.LIB.NODE_ENV.PROD) ? (
            res.status(200).json({
                success: false,
                data: {},
                message: config.LIB.RESPONSE_MESSAGE.SERVER_ERROR(),
            })
        ) : (
            res.status(200).json({
                success: false,
                data: {},
                message: `Server error: ${error}`,
            })
        )
    )
}

const httpHandlerWrapper = ({dataFunction, promiseHandler}) => {
    return async (req, res, next) => {
        return await promiseHandler(req, res, next, dataFunction(req))
            .catch(error => {
                return httpHandleError({
                    error: error,
                    res: res
                })
            })
    }
}

module.exports = {
    Error400,
    Error401,
    Error403,
    Error404,
    Error500,
    CustomError,
    httpHandlerWrapper,
    wsHandlerWrapper
}