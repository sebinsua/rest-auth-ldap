'use strict';

var Promise = require('bluebird'),
    debug = require('debug')('rest-auth-ldap:services:auth');

var generateErrorResponder = require('../core/error-response-handler');

function render(res) {
    return function (authResult) {
        debug(authResult);
        return res.json({
            success: true,
            authToken: authResult
        });
    };
}

function AuthService() {}

AuthService.prototype.getAuthToken = function (req, res, next) {
    var getAuthToken = Promise.resolve({});
    getAuthToken.then(render(res))
                .catch(generateErrorResponder(req, res, next));
};

module.exports = new AuthService();
