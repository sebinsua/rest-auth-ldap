'use strict';

var winston = require('winston');

var generateLogger = function generateLogger(config) {

    // We do not want unhandled exceptions...
    winston.emitErrs = true;

    var console = new winston.transports.Console({
        json: false,
        colorize: true,
        handleExceptions: true
    });

    var logger = new winston.Logger({
        transports: [
            console,
            new winston.transports.File({ name: 'all', filename: config.SERVICE_APP_LOG, json: false }),
            new winston.transports.File({ name: 'errors', filename: config.SERVICE_ERROR_LOG, json: false, level: 'error' })
        ],
        exceptionHandlers: [
            console,
            new winston.transports.File({ name: 'exceptions', filename: config.SERVICE_ERROR_LOG, json: false })
        ],
        exitOnError: true
    });

    logger.stream = {
        write: function (message) {
            var messageWithoutNewline = message[message.length - 1] === '\n' ?
                                        message.slice(0, -1) :
                                        message;
            // Set up in app/configure.
            // ':method :url :id - :status :res[content-length] :response-time ms'
            // Matches when the status code is 5xx.
            var withServerError = /^[A-Z]*\s[^\s]*\s[^\s]*\s-\s(5[0-9]{2})/;
            if (messageWithoutNewline.match(withServerError)) {
                logger.error(messageWithoutNewline);
            } else {
                logger.info(messageWithoutNewline);
            }
        }
    };

    return logger;
};

module.exports = generateLogger;
