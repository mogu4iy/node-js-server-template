const TOPIC = {
    EXAMPLE_TOPIC: {
        topic: "example_topic",
        numPartitions: 1,
        configEntries: [{name: 'cleanup.policy', value: 'compact'}],
        replicationFactor: 2
    },
}

const CONSUMER = ({server_id}) => ({
    EXAMPLE: {
        groupId: "example",
        topicList: [{
            topic: TOPIC.EXAMPLE_TOPIC.topic,
            fromBeginning: true
        }],
    }
})

module.exports = ({server_id}) => ({
    KAFKA: {
        CLIENT_ID: process.env.KAFKA_CLIENT_ID,
        HOST_LIST: [`${process.env.KAFKA_1_HOST}:${process.env.KAFKA_1_PORT}`, `${process.env.KAFKA_2_HOST}:${process.env.KAFKA_2_PORT}`],
        SSL: {},
        RETRY: {
            initialRetryTime: 100,
            retries: 8
        },
        CONSUMER: CONSUMER({server_id}),
        TOPIC: TOPIC,
    }
})
