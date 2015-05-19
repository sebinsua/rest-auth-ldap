'use strict';

var uuid = require('node-uuid');

module.exports = function assignId(req, res, next) {
    // This requestId is useful when debugging.
    // If there is an X-Request-Id sent in the headers (allowing logging
    // across an SOA/microservices infrastructure) then it will be used.
    // Otherwise we will generate a new uuid.
    var requestId = req.headers['X-Request-Id'] || uuid.v4();
    req.id = requestId;
    next();
};
