const {createClient} = require('redis');
const config = require("../../config");
const {logger} = require("../logger");

const client = createClient({
    url: config.REDIS.BASE_URL
});

const init = async () => {
    await client.connect()
    client.on('error', (err) => {
        logger.error(err)
    });
}

module.exports = {
    redis: client,
    init
}