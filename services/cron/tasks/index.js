const moment = require("moment");
const {logger} = require("../../logger");
const config = require("../../../config")

const exampleTask = ({interval: {key: intervalKey, value: intervalValue, cron: intervalCron}}) => {
    return {
        period: intervalCron,
        task: async () => {
            const now = moment()
            let stop = false
            const check = () => {
                if (stop) {
                    throw new Error(`exampleTask: task that runs in ${intervalKey} took more than ${intervalValue * 0.9 / 1000}s.`)
                }
            }
            try {
                const timeout = setTimeout(() => {
                    stop = true
                }, intervalValue * 0.9)
                check()
                clearTimeout(timeout)
                logger.debug(`exampleTask: for period ${intervalKey} took ${moment.duration(moment().diff(now)).asSeconds()}s.`)
            } catch (e) {
                logger.warning(e)
            }
        }
    }
};

module.exports = {
    exampleTask
};