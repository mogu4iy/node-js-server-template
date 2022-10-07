const {v4: uuidv4} = require('uuid');

module.exports = () => {
    return {
        SERVER: {
            APP_NAME: process.env.APP_NAME,
            APP_VERSION: Number.parseInt(process.env.APP_VERSION),
            PID: process.pid,
            ID: uuidv4(),
            PORT: process.env["PORT"],
            HEALTH: false,
        }
    };
};
