const config = require("../../config")
const {RabbitMQClient} = require("../../utils/rabbitmq")
const {
    serializeToJsonMiddleware,
} = require("./handlers/utils")

const rabbitMQClient = new RabbitMQClient({
    baseUrl: config.RABBIT_MQ.BASE_URL,
    exchangeList: Object.values(config.RABBIT_MQ.EXCHANGE),
    queueList: Object.values(config.RABBIT_MQ.QUEUE),
    queueBindingsList: config.RABBIT_MQ.BINDINGS.QUEUE,
    prefetch: config.RABBIT_MQ.PREFETCH
})

const init = async () => {
    rabbitMQClient.use(config.RABBIT_MQ.QUEUE.EXAMPLE_QUEUE.name,
        serializeToJsonMiddleware)
    await rabbitMQClient.connect()
}

module.exports = {
    rabbitMQClient,
    init
}