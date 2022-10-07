const config = require("../../config")
const {KafkaClient} = require("../../utils/kafka")
const {
    serializeToJsonMiddleware,
} = require("./handlers/utils")

const kafkaClient = new KafkaClient({
    clientId: config.KAFKA.CLIENT_ID,
    hostList: config.KAFKA.HOST_LIST,
    retryConfig: config.KAFKA.RETRY,
    sslConfig: null,
    consumerList: Object.values(config.KAFKA.CONSUMER),
    topicList: Object.values(config.KAFKA.TOPIC)
})

const init = async () => {
    kafkaClient.use(
        config.KAFKA.CONSUMER.EXAMPLE.groupId,
        config.KAFKA.TOPIC.EXAMPLE_TOPIC.topic,
        serializeToJsonMiddleware)
    await kafkaClient.connect()
}

module.exports = {
    kafkaClient,
    init
}