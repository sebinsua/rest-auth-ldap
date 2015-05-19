'use strict';
/* eslint no-unused-vars: 0 */

var logError = function logError(err, req) {
    var logger = req.app.get('logger');
    if (!err.status || (err.status && parseInt(err.status)[0] === '5')) {
        logger.error(JSON.stringify(err, null, 2));
        logger.error(err.stack);
    }
};

module.exports = function (NODE_ENV) {

    var errorHandler;
    if (NODE_ENV === 'development') {
        // NOTE: eslint may tell you to remove the argument that is not in use
        //       but DO NOT do so as arity of the function is used by Express
        //       to decide whether to pass errors towards it.
        errorHandler = function developmentErrorHandler(err, req, res, next) {
            logError(err, req);

            var errorResponse = {
                success: false,
                message: err.message,
                rawError: err
            };
            // Development error handler will print a stacktrace if one exists.

            res.status(err.status || 500).
                json(errorResponse);
        };
    } else {
        // Production error handler will leak no stacktraces to the user.
        errorHandler = function productionErrorHandler(err, req, res, next) {
            logError(err, req);

            var errorResponse = {
                success: false,
                message: err.message
            };

            res.status(err.status || 500).
                json(errorResponse);
        };
    }

    return errorHandler;
};
