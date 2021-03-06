'use strict';

var errorCodeToStatusCode = {
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NETWORK_ERROR': 500
};

var generateErrorResponder = function (req, res) {
    return function jsonErrorResponder(error) {
        var logger = req.app.get('logger');
        if (logger) {
            var relation = req.method + ' ' + req.path + ' ' + req.id;
            logger.error(relation + ' - ' + error.message + '\n' + JSON.stringify(error));
        }

        res.status(errorCodeToStatusCode[error.code] || 500);
        res.json({
            success: false,
            message: error.message,
            details: error.details
        });
    };
};

module.exports = generateErrorResponder;
