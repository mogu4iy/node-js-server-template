const {WebSocketServer, OPEN} = require("ws")
const {v4: uuidv4} = require('uuid')
const config = require("../config")
const {wsHandler, configureResponseMessage, configureDataMessage, configurePingMessage} = require("./ws_server")
const {logger} = require("../services/logger");

class WsServer {
    _port = null
    #server = null
    #ws_server = null
    #methods = {}

    constructor({port, server}) {
        this._port = port
        this.#server = server
    }

    use(method, ...controllers) {
        if (typeof method !== "string") {
            throw new Error(`Method type ${typeof method} is not valid (must be string)`)
        }
        for (let controller of controllers) {
            if (typeof controller !== "function") {
                throw new Error(`Controller type ${typeof controller} is not valid (must be function)`)
            }
        }
        this.#methods[method] = wsHandler(...controllers)
    }

    listen(path = "/") {
        if (this.#ws_server) {
            throw new Error("Server is already listening")
        }
        this.#ws_server = new WebSocketServer({server: this.#server, perMessageDeflate: false, path: path})
        // arrow function is used to have access to class context
        this.#ws_server.on('connection', (ws) => this.#onConnection(ws));
    }

    send({ws_id, method, data, meta}) {
        for (let client of this.#ws_server.clients) {
            try {
                if (client.readyState === OPEN && client._id === ws_id) {
                    client.send(configureDataMessage({
                        method,
                        meta,
                        data
                    }));
                    return true
                }
            } catch (e) {
                logger.error(e)
            }
        }
        return false
    }

    sendToClientList({ws_id, method, data, meta}) {
        this.#ws_server.clients.forEach(client => {
            try {
                if (ws_id.includes(client._id)) {
                    if (client.readyState === OPEN) {
                        client.send(configureDataMessage({
                            method,
                            meta,
                            data
                        }));
                    }
                }
            } catch (e) {
                logger.error(e)
            }
        })
    }

    #onConnection(ws) {
        try {
            ws._id = this.#getWsId()
            // arrow function is used to have access to class context

            ws.on("message", (data) => this.#onMessage(ws, data))
            ws.on('ping', () => {
                ws.pong();
            });
            const interval = setInterval(() => {
                if (ws.readyState === OPEN) {
                    ws.send(configurePingMessage())
                    ws.ping();
                }
            }, 10000);
            ws.on('close', async () => {
                await this.#onCLose(ws)
                clearInterval(interval)
            });
            return ws.send(configureResponseMessage({
                method: config.LIB.WS_METHOD.CONNECTION,
                message: config.LIB.RESPONSE_MESSAGE.CONNECTION_SUCCESS(),
                error: false
            }))
        } catch (e) {
            logger.error(e)
            ws.send(configureResponseMessage({
                method: config.LIB.WS_METHOD.CONNECTION,
                message: config.LIB.RESPONSE_MESSAGE.CONNECTION_FAILED(),
                error: true
            }))
            return ws.terminate()
        }
    }

    async #onMessage(ws, data) {
        try {
            const messageObj = this.#parseMessage(JSON.parse(data.toString()))
            if (!messageObj["method"]) {
                return ws.send(configureResponseMessage({
                    method: config.LIB.WS_METHOD.ERROR,
                    message: config.LIB.RESPONSE_MESSAGE.METHOD_NOT_VALID(data["method"]),
                    error: true
                }))
            }
            const controller = this.#methods[messageObj["method"]]
            if (!controller) {
                return ws.send(configureResponseMessage({
                    method: config.LIB.WS_METHOD.ERROR,
                    message: config.LIB.RESPONSE_MESSAGE.METHOD_NOT_VALID(messageObj["method"]),
                    error: true
                }))
            }
            const context = {
                method: messageObj["method"]
            }
            return await controller(messageObj["data"], context, ws, this)
        } catch (e) {
            logger.error(e)
            return this.#sendServerError(ws, e)
        }
    }

    #parseMessage(message = {}) {
        return {
            method: message["method"],
            data: message["data"],
        }
    }

    async #close(ws_id) {
        try {
        } catch (e) {
            logger.error(e)
        }
    }

    async #onCLose(ws) {
        try {
            await this.#close(ws._id)
        } catch (e) {
            logger.error(e)
        }
    }

    #getWsId() {
        return uuidv4()
    }

    get clientsWsId() {
        const activeClientIdList = []
        this.#ws_server.clients.forEach(client => {
            if (client._id && client.readyState === OPEN) {
                activeClientIdList.push(client._id)
            }
        })
        return activeClientIdList
    }

    #sendServerError(ws, error) {
        return ws.send(configureResponseMessage({
            method: config.LIB.WS_METHOD.ERROR,
            message: config.LIB.RESPONSE_MESSAGE.SERVER_ERROR(),
            error: true
        }))
    }

    isOpen({ws_id}) {
        let found = false
        this.#ws_server.clients.forEach(client => {
            if (client._id === ws_id) {
                found = true
                if (client.readyState !== OPEN) {
                    return false
                }
            }
        })
        return found
    }
}

module.exports = {
    WsServer
}