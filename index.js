const chalk = require("chalk");
const merge = require("deepmerge");
const fs = require("fs");
const fetch = require("node-fetch");

/* 
 * Internal Functions
*/

Number.prototype.zeroPad = function (length) {
    length = length || 2; // defaults to 2 if no parameter is passed
    return (new Array(length).join("0") + this).slice(length * -1);
};

/* The Logger */
class Logger {

    /**
     * Creates a new Logger
     * @param {string} application - The name of the main application
     * @param {string} subprocess  - The name of the subprocess sending the message (eg. Database Handler, Web Server)
     * @example
const tsjl = require("tsjl");
const logger = new tsjl.Logger("tsjl-example-app", "database-handler")
    */
    constructor(application, subprocess, outputSettings) {
        if (application == null) {
            throw "Application cannot be null";
        }
        if (subprocess == null) {
            throw "Subprocess cannot be null";
        }
        const defaultOutputSettings = {
            stdout: {
                enable: true,
                level: 4,
                json: false
            },
            webhook: {
                url: null,
            },
            file: [{
                path: "./log.log",
                json: true,
                level: 7
            }]
        };
        if (outputSettings) {
            this.outputSettings = merge(defaultOutputSettings, outputSettings, {
                arrayMerge: (destinationArray, sourceArray, options) => sourceArray
            });
        } else {
            this.outputSettings = defaultOutputSettings;
        }
        //console.log(this.outputSettings);
        this.application = application;
        this.subprocess = subprocess;
    }


    /**
     * Log a message
     * @param {string|number} level - Can be a level string, or number. Possible levels and assosiated numbers: <code>TRACE</code> - <code>7</code>, <code>VERBOSE</code> - <code>6</code>, <code>DEBUG</code> - <code>5</code>, <code>INFO</code> - <code>4</code>, <code>SUCCESS</code> - <code>3</code>, <code>WARNING</code> - <code>2</code>, <code>ERROR</code> - <code>1</code>, <code>FATAL</code> - <code>0</code>
     * @param {string} message - The message to send
     * @param {Object} [extra]  - An object with any extra data to be logged
     * @example
    const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.log("WARNING", "Database table 'foo' missing")
     * @example
    const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.log(2, "Database table 'foo' missing", {server:"server1.example.com", database:"bar"})
    */
    log(level, msg, extra) {
        let levelValue;
        if (level == 0) {
            level = "FATAL";
            levelValue = 0;
        } else if (level == 1) {
            level = "ERROR";
            levelValue = 1;
        } else if (level == 2) {
            level = "WARNING";
            levelValue = 2;
        } else if (level == 3) {
            level = "SUCCESS";
            levelValue = 3;
        } else if (level == 4) {
            level = "INFO";
            levelValue = 4;
        } else if (level == 5) {
            level = "DEBUG";
            levelValue = 5;
        } else if (level == 6) {
            level = "VERBOSE";
            levelValue = 6;
        } else if (level == 7) {
            level = "TRACE";
            levelValue = 7;
        } else {
            level = level.toUpperCase();
        }
        const humanMessage = `[${this.application}.${this.subprocess}] [${level}] ${msg}`;
        let consoleMessage;
        if (level == "FATAL") {
            consoleMessage = chalk.bgRed(humanMessage);
            levelValue = 0;
        } else if (level == "ERROR") {
            consoleMessage = chalk.red(humanMessage);
            levelValue = 1;
        } else if (level == "WARNING") {
            consoleMessage = chalk.yellow(humanMessage);
            levelValue = 2;
        } else if (level == "SUCCESS") {
            consoleMessage = chalk.green(humanMessage);
            levelValue = 3;
        } else if (level == "INFO") {
            consoleMessage = humanMessage;
            levelValue = 4;
        } else if (level == "DEBUG") {
            consoleMessage = chalk.magenta(humanMessage);
            levelValue = 5;
        } else if (level == "VERBOSE") {
            consoleMessage = chalk.blue(humanMessage);
            levelValue = 6;
        } else if (level == "TRACE") {
            consoleMessage = chalk.gray(humanMessage);
            levelValue = 7;
        } else {
            throw "Unknown Level";
        }


        const date = new Date();
        let offset = (date.getTimezoneOffset() * -1) / 60;
        if (offset > 0) {
            offset = "+" + offset.zeroPad();
        }
        const json = JSON.stringify({
            date: date,
            level: level,
            appName: this.application,
            subprocess: this.subprocess,
            message: msg,
            extra: extra
        });
        const timeString = `[${date.getFullYear()}-${(date.getMonth() + 1).zeroPad()}-${date.getDate().zeroPad()} ${date.getHours().zeroPad()}:${date.getMinutes().zeroPad()}:${date.getSeconds().zeroPad()} GMT${offset}]`;
        if (this.outputSettings.stdout.enable && levelValue <= this.outputSettings.stdout.level && !this.outputSettings.stdout.json) console.log(`${chalk.gray(timeString)} ${consoleMessage}`);
        if (this.outputSettings.stdout.enable && levelValue <= this.outputSettings.stdout.level && this.outputSettings.stdout.json) console.log(json);
        this.outputSettings.file.forEach(file => {
            if (file.json) {
                fs.appendFileSync(file.path, json + "\n");
            } else if (!file.json) {
                fs.appendFileSync(file.path, `${timeString} ${humanMessage}\n`);
            }
        });
    }


    /**
     * Log a message with the level "fatal".
     * @param {string} message - The message to send
     * @param {Object} [extra]  - An object with any extra data to be logged
     * @example
    const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.fatal("Failed to connect to database, exiting...")
    */
    fatal(msg, extra) {
        this.log("FATAL", msg, extra);
    }


    /**
 * Log a message with the level "error".
 * @param {string} message - The message to send
 * @param {Object} [extra]  - An object with any extra data to be logged
 * @example
const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.error("Failed to connect to database, retrying in 30 seconds")
*/
    error(msg, extra) {
        this.log("ERROR", msg, extra);
        if(this.outputSettings.webhook.url){
            if (extra != undefined && extra.constructor === {}.constructor)
                extra = `\n\`\`\`json\n${JSON.stringify(extra, null, 4)}\n\`\`\``;
            else if(extra == undefined)
                extra = "";
            fetch(this.outputSettings.webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: null,
                    embeds: [
                        {
                            title: "Error",
                            description: `${msg}\n${extra}`,
                            color: 16711680,
                        }
                    ],
                    attachments: []         
                })
            })
                .then(res => {
                    if(res.status != "204")
                        this.log("FATAL", "Unexpected response", { status: res.status, message: res.statusText });
                })
                .catch(err => {
                    this.log("FATAL", "Webhook failed to send", { error: err });
                });
        }
    }


    /**
     * Log a message with the level "wanring".
     * @param {string} message - The message to send
     * @param {Object} [extra]  - An object with any extra data to be logged
     * @example
    const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.warn("Database table 'foo' missing")
    */
    warn(msg, extra) {
        this.log("WARNING", msg, extra);
    }


    /**
* Log a message with the level "success".
* @param {string} message - The message to send
* @param {Object} [extra]  - An object with any extra data to be logged
* @example
const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.success("Connected to the database!")
*/
    success(msg, extra) {
        this.log("SUCCESS", msg, extra);
    }

    /**
     * Log a message with the level "info".
     * @param {string} message - The message to send
     * @param {Object} [extra]  - An object with any extra data to be logged
     * @example
    const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.info("Connected to the database!")
    */
    info(msg, extra) {
        this.log("INFO", msg, extra);
    }


    /**
 * Log a message with the level "debug".
 * @param {string} message - The message to send
 * @param {Object} [extra]  - An object with any extra data to be logged
 * @example
const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.debug("Connection fron 127.0.0.1")
*/
    debug(msg, extra) {
        this.log("DEBUG", msg, extra);
    }


    /**
 * Log a message with the level "verbose".
 * @param {string} message - The message to send
 * @param {Object} [extra]  - An object with any extra data to be logged
 * @example
const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.verbose("no idea")
*/
    verbose(msg, extra) {
        this.log("VERBOSE", msg, extra);
    }

    /**
 * Log a message with the level "trace".
 * @param {string} message - The message to send
 * @param {Object} [extra]  - An object with any extra data to be logged
 * @example
const tsjl = require("tsjl");
const logger = new tsjl.Logger("TSJL Example App", "Database Handler")
logger.trace("Resolved 'example.com' to '93.184.216.34'")
*/
    trace(msg, extra) {
        this.log("TRACE", msg, extra);
    }
}

module.exports.Logger = Logger;