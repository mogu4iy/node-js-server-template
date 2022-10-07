module.exports = () => {
    return {
        LOGGER: {
            SEVERITY: {
                EMERGENCY: {
                    key: "emerg",
                    code: 0
                },
                ALERT: {
                    key: "alert",
                    code: 1
                },
                CRITICAL: {
                    key: "crit",
                    code: 2
                },
                ERROR: {
                    key: "err",
                    code: 3
                },
                WARNING: {
                    key: "warning",
                    code: 4
                },
                NOTICE: {
                    key: "notice",
                    code: 5
                },
                INFORMATIONAL: {
                    key: "info",
                    code: 6
                },
                DEBUG: {
                    key: "debug",
                    code: 7
                }
            },
            FACILITY: {
                KERNEL: {
                    key: "kern",
                    code: 0
                },
                USER_LEVEL: {
                    key: "user",
                    code: 1
                },
                MAIL: {
                    key: "mail",
                    code: 2
                },
                DAEMON: {
                    key: "daemon",
                    code: 3
                },
                AUTH: {
                    key: "auth",
                    code: 4
                },
                SYSLOG: {
                    key: "syslog",
                    code: 5
                },
                LINE_PRINTER: {
                    key: "lpr",
                    code: 6
                },
                NEWS: {
                    key: "news",
                    code: 7
                },
                UUCP: {
                    key: "uucp",
                    code: 8
                },
                CRON: {
                    key: "cron",
                    code: 9
                },
                AUTH_PRIV: {
                    key: "authpriv",
                    code: 10
                },
                FTP: {
                    key: "ftp",
                    code: 11
                },
                NTP: {
                    key: "ntp",
                    code: 12
                },
                AUDIT: {
                    key: "security",
                    code: 13
                },
                ALERT: {
                    key: "console",
                    code: 14
                },
                SHEDULE: {
                    key: "solaris-cron",
                    code: 15
                },
                LOCAL0: {
                    key: "local0",
                    code: 16
                },
                LOCAL1: {
                    key: "local1",
                    code: 17
                },
                LOCAL2: {
                    key: "local2",
                    code: 18
                },
                LOCAL3: {
                    key: "local3",
                    code: 19
                },
                LOCAL4: {
                    key: "local4",
                    code: 20
                },
                LOCAL5: {
                    key: "local5",
                    code: 21
                },
                LOCAL6: {
                    key: "local6",
                    code: 22
                },
                LOCAL7: {
                    key: "local7",
                    code: 23
                },
            }
        }
    };
};
