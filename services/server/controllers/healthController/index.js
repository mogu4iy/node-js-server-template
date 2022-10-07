const config = require("../../../../config");
const errors = require("../../../../utils/errors");
const {Error500} = require("../../../../utils/errors");

// @route GET api/health
// @desc Check server health
// @access Public
// @data []
const healthData = (req) => {
    return {};
};
const healthPromise = async (req, res, next, data) => {
    if (!config.SERVER.HEALTH) {
        throw new Error500("")
    }
    return res.status(200).send(config.SERVER.APP_NAME);
};

module.exports = {
    healthController: errors.httpHandlerWrapper({
        dataFunction: healthData,
        promiseHandler: healthPromise,
    }),
};
