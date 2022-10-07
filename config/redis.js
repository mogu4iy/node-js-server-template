module.exports = () => {
    return {
        REDIS: {
            BASE_URL: process.env.REDIS_BASE_URL ?? `${process.env.REDIS_PROTOCOL}://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            KEY: {
                EXAMPLE: "_example",
            },
            EXPIRATION_TIMEOUT: {},
        }
    };
};
