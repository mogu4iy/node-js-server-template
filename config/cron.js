module.exports = () => {
    return {
        CRON: {
            TASK: {
                EXAMPLE_TASK: {
                    interval: {
                        key: "20m",
                        value: 20 * 60000,
                        cron: "*/20 * * * *"
                    }
                }
            }
        }
    };
};
