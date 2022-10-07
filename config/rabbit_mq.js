const EXCHANGE = () => ({
    EXAMPLE_EXCHANGE: {
        name: "example_exchange",
        type: "topic",
        options: {durable: true}
    }
})

const TOPIC = ({server_id}) => ({
    EXAMPLE_TOPIC: () => `example_topic.${server_id}`,
})

const ROUTING_KEY = () => ({})

const QUEUE = ({server_id}) => ({
    EXAMPLE_QUEUE: {
        name: `example_queue${server_id}`,
        options: {durable: false, autoDelete: true}
    },
})

module.exports = ({server_id}) => ({
    RABBIT_MQ: {
        PREFETCH: 200,
        BASE_URL: process.env.RABBIT_MQ_BASE_URL ?? `${process.env.RABBIT_MQ_PROTOCOL}://${process.env.RABBIT_MQ_USERNAME}:${process.env.RABBIT_MQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}${process.env.RABBIT_MQ_VHOST}`,
        EXCHANGE: EXCHANGE(),
        TOPIC: TOPIC({server_id}),
        ROUTING_KEY: ROUTING_KEY(),
        QUEUE: QUEUE({server_id}),
        BINDINGS: {
            QUEUE: [
                [QUEUE({server_id}).EXAMPLE_QUEUE.name, EXCHANGE().EXAMPLE_EXCHANGE.name, TOPIC({server_id}).EXAMPLE_TOPIC()],
            ]
        }
    }
})
