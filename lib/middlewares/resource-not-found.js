'use strict';

module.exports = function resourceNotFound(req, res, next) {
    var error = new Error('Resource not found.');
    error.status = 404;

    return next(error);
};
