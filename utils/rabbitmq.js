const amqp = require('amqplib');
const {logger} = require("../services/logger");
const {sleep} = require("./server")
const config = require("../config");

const handler = (...callbackList) => {
    callbackList = callbackList.reverse()
    const cb = callbackList.reduce((prev, callback) => {
        return async (hData, context, channel) => {
            return await callback(hData, context, channel, () => prev(hData, context, channel))
        }
    }, () => {
    })
    return async (data, context, channel) => {
        try {
            return await cb(data, context, channel)
        } catch (e) {
            logger.error(e)
        }
    }
};

class RabbitMQClient {
    #handlers = {}
    #exchangeList = []
    #queueList = []
    #queueBindingsList = []
    #prefetch = 1
    #connection = null
    #baseUrl = null
    #channel = null

    constructor({baseUrl, exchangeList = [], queueList = [], queueBindingsList = [], prefetch = 1}) {
        this.#connection = null
        this.#baseUrl = baseUrl
        this.#exchangeList = exchangeList
        this.#queueList = queueList
        this.#queueBindingsList = queueBindingsList
        this.#prefetch = prefetch
    }

    async connect() {
        if (this.#connection) {
            throw new Error("Connection is already stable.")
        }
        this.#connection = await amqp.connect(this.#baseUrl);
        this.#connection.on("error", this.#onConnectionError)
        this.#connection.on("close", this.#onConnectionClose)
        this.#channel = await this.#connection.createChannel()
        this.#channel.on("error", this.#onChannelError)
        this.#channel.prefetch(this.#prefetch)
        for (let exchange of this.#exchangeList) {
            await this.#assertExchange(exchange)
        }
        for (let queue of this.#queueList) {
            await this.#assertQueue(queue)
        }
        for (let binding of this.#queueBindingsList) {
            this.#channel.bindQueue(...binding)
        }
    }

    async #assertExchange(exchange) {
        await this.#channel.assertExchange(exchange["name"], exchange["type"], exchange["options"])
    }

    async publish({exchange, routing_key, data}) {
        if (exchange === undefined || !this.#exchangeList.map(exchange => exchange.name).includes(exchange)) {
            throw new Error(`Exchange ${exchange} is absent or invalid.`)
        }
        try {
            await this.#channel.publish(exchange, routing_key, Buffer.from(JSON.stringify(data)))
        } catch (e) {
            logger.error(e)
        }
    }

    use(queue, ...controllers) {
        if (typeof queue !== "string") {
            throw new Error(`Queue type ${typeof queue} is not valid (must be 'string')`)
        }
        for (let controller of controllers) {
            if (typeof controller !== "function") {
                throw new Error(`Controller type ${typeof controller} is not valid (must be 'function')`)
            }
        }
        this.#handlers[queue] = handler(...controllers)
    }

    async #assertQueue(queue) {
        await this.#channel.assertQueue(queue.name, queue.options)
        if (!this.#handlers[queue.name]) {
            return
        }
        // arrow function is used to have access to class context
        await this.#channel.consume(queue.name, async (msg) => {
            if (!msg) {
                throw new Error(`Message '${msg}' is wrong.`)
            }
            if (!this.#handlers[queue.name]) {
                return
            }
            const context = {
                queue: queue.name
            }
            try {
                await this.#handlers[queue.name](msg, context, this.#channel)
                this.#channel.ack(msg)
            } catch (e) {
                logger.error(e)
            }
        });
    }

    #onChannelError = async (error) => {
        this.#channel = await this.#connection.createChannel()
        this.#channel.prefetch(this.#prefetch)
        this.#channel.on("error", this.#onChannelError)
        for (let exchange of this.#exchangeList) {
            await this.#assertExchange(exchange)
        }
        for (let queue of this.#queueList) {
            await this.#assertQueue(queue)
        }
        for (let binding of this.#queueBindingsList) {
            this.#channel.bindQueue(...binding)
        }
    }

    #onConnectionError = async (error) => {
        let count = 10
        this.#connection = null
        this.#channel = null
        while (!this.#connection || !this.#channel || count > 0) {
            count -= 1
            await sleep(20000)
                .then(() => {
                    return this.connect()
                })
                .catch(error => {
                })
        }
        if (!this.#connection || !this.#channel) {
            throw new Error("Rabbitmq connection closed.")
        }
    }

    #onConnectionClose = async () => {
        let count = 10
        this.#connection = null
        this.#channel = null
        while (!this.#connection || !this.#channel || count > 0) {
            count -= 1
            await sleep(20000)
                .then(() => {
                    return this.connect()
                })
                .catch(error => {})
        }
        if (!this.#connection || !this.#channel){
            throw new Error("Rabbitmq connection closed.")
        }
    }
}

module.exports = {
    RabbitMQClient,
}