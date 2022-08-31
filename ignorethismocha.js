const tsjl = require("./index");
let logger = new tsjl.Logger("foo", "bar");
logger.info("Connected to the database!");
logger.log(2, "Database table 'foo' missing", { server: "server1.example.com", database: "bar" });
logger.info("Testing '.log' with numbers\n--\n--");
logger.log(0, "Example");
logger.log(1, "Example");
logger.log(2, "Example");
logger.log(3, "Example");
logger.log(4, "Example");
logger.log(5, "Example");
logger.log(6, "Example");
logger.log(7, "Example");
logger.info("Testing aliases\n--\n--");
logger.fatal("aliases");
logger.error("aliases");
logger.warn("aliases");
logger.success("aliases");
logger.info("aliases");
logger.debug("aliases");
logger.verbose("aliases");
logger.trace("aliases");
logger.info("Testing json\n--\n--");
logger = new tsjl.Logger("foo", "bar", {
    stdout: {
        json: true
    },
    webhook: {
        url: "https://discord.com/api/webhooks/1234/abcd"
    }
});
logger.fatal("JSON");
logger.error("JSON", {"message": "Unexpected error"});
logger.warn("JSON");
logger.success("JSON");
logger.info("JSON");
logger.debug("JSON");
logger.verbose("JSON");
logger.trace("JSON");
logger.info("Human Readable Log\n--\n--");
logger = new tsjl.Logger("foo", "bar", {
    stdout: {
        enable: false
    },
    file: [
        {
            enable: true,
            json: false,
            path: "./human.log"
        }
    ]
});
logger.fatal("LOG");
logger.error("LOG");
logger.warn("LOG");
logger.success("LOG");
logger.info("LOG");
logger.debug("LOG");
logger.verbose("LOG");
logger.trace("LOG");