const cron = require("node-cron");
const config = require("../../config");
const {
    exampleTask
} = require("./tasks");

const init = () => {
    const exampleTaskInstance = exampleTask({
        interval: config.CRON.TASK.EXAMPLE_TASK.interval,
    })
    cron.schedule(exampleTaskInstance.period, exampleTaskInstance.task)
}

module.exports = {init}