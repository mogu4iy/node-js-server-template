const {Kafka} = require("kafkajs");
const {logger} = require("../services/logger");

const handler = (...callbackList) => {
    callbackList = callbackList.reverse()
    const cb = callbackList.reduce((prev, callback) => {
        return async (hData, context, kafka) => {
            return await callback(hData, context, kafka, () => prev(hData, context, kafka))
        }
    }, () => {
    })
    return async (data, context, kafka) => {
        try {
            return await cb(data, context, kafka)
        } catch (e) {
            await logger.error(e)
        }
    }
};

class KafkaClient {
    #clientId
    #hostList = []
    #topicList = []
    #consumer = {}
    #config = {}

    #connection = null
    #producer = null
    #consumerList = []
    #handler = {}

    #admin = null

    // sslConfig = {"rejectUnauthorized": false, "ca": [fs.readFileSync('/my/custom/ca.crt', 'utf-8')], "key": fs.readFileSync('/my/custom/client-key.pem', 'utf-8'), "cert": fs.readFileSync('/my/custom/client-cert.pem', 'utf-8')}
    // retryConfig = {"initialRetryTime": 100, "retries": 8}
    // consumerList = [{"groupId": "name", "topicList": {"topic": "topic", "fromBeginning": true}}]
    constructor({
                    clientId,
                    hostList = [],
                    sslConfig = null,
                    retryConfig = null,
                    connectionTimeout = 3000,
                    requestTimeout = 25000,
                    consumerList = [],
                    topicList = []
                }) {
        if (hostList.length === 0) {
            throw new Error("Host list must contain 1 element as minimum.")
        }
        this.#clientId = clientId
        this.#hostList = hostList
        this.#topicList = topicList
        this.#config = {
            ...this.#config,
            connectionTimeout: connectionTimeout,
            requestTimeout: requestTimeout
        }
        if (sslConfig) {
            this.#config = {...this.#config, ssl: sslConfig}
        }
        if (retryConfig) {
            this.#config = {...this.#config, retry: retryConfig}
        }
        this.#consumerList = consumerList
    }

    async connect() {
        if (this.#connection) {
            throw new Error("Connection is already stable.")
        }
        this.#connection = new Kafka({
            clientId: this.#clientId,
            brokers: [...this.#hostList],
            ...this.#config
        })
        await this.#assertAdmin()
        await this.#assertProducer()
        for (let consumer of this.#consumerList) {
            await this.#assertConsumer({groupId: consumer.groupId, topicList: consumer.topicList})
        }
    }

    async send({topic, messageList}) {
        return await this.#producer.send({
            topic: topic,
            messages: messageList,
        })
    }

    async #assertConsumer({groupId, partitionsConsumedConcurrently = 1, topicList}) {
        if (this.#consumer[groupId]) {
            throw new Error(`Consumer with groupId ${groupId} already exists.`)
        }
        this.#consumer[groupId] = this.#connection.consumer({groupId: groupId})
        await this.#consumer[groupId].connect()
        for (let topic of topicList) {
            await this.#consumer[groupId].subscribe({...topic})
        }
        await this.#consumer[groupId].run({
            partitionsConsumedConcurrently: partitionsConsumedConcurrently,
            eachMessage: async ({topic, partition, message}) => {
                if (!this.#handler[groupId]) {
                    return
                }
                if (!this.#handler[groupId][topic]) {
                    return
                }
                const context = {
                    topic: topic,
                    partition: partition,
                    headers: message.headers,
                }
                await this.#handler[groupId][topic](message, context, this)
            },
        })
    }

    async #assertProducer() {
        if (this.#producer) {
            throw new Error(`Producer already exists.`)
        }
        this.#producer = this.#connection.producer()
        await this.#producer.connect()
    }

    async #assertAdmin() {
        if (this.#admin) {
            throw new Error(`Admin already exists.`)
        }
        this.#admin = this.#connection.admin()
        await this.#admin.connect()
        const topicExistList = await this.#admin.listTopics()
        for (let topicObj of this.#topicList) {
            if (!topicExistList.includes(topicObj.topic)) {
                const created = await this.#admin.createTopics({
                    validateOnly: false,
                    waitForLeaders: true,
                    topics: [{
                        ...topicObj
                    }],
                })
            }
        }
        await this.#admin.disconnect()
    }

    use(groupId, topic, ...controllerList) {
        if (typeof topic !== "string") {
            throw new Error(`Topic type ${typeof topic} is not valid (must be 'string')`)
        }
        if (typeof groupId !== "string") {
            throw new Error(`Group id type ${typeof groupId} is not valid (must be 'string')`)
        }
        for (let controller of controllerList) {
            if (typeof controller !== "function") {
                throw new Error(`Controller type ${typeof controller} is not valid (must be 'function')`)
            }
        }
        if (!this.#handler[groupId]) {
            this.#handler[groupId] = {}
        }
        this.#handler[groupId][topic] = handler(...controllerList)
    }

    static prepareMessage({key = null, value, timestamp = null, partition = null, headers = null}) {
        const config = {}
        if (partition) {
            config["partition"] = partition
        }
        if (timestamp) {
            config["timestamp"] = timestamp
        }
        if (headers) {
            config["headers"] = headers
        }
        if (key) {
            config["key"] = key
        }
        return {
            value: JSON.stringify(value),
            ...config
        }
    }
}

module.exports = {
    KafkaClient
}