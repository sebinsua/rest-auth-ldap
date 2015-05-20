'use strict';

var express = require('express');

var authService = require('./services/auth');

var methodNotFound = require('../lib/middlewares/method-not-found');

var generateErrorResponder = require('./core/error-response-handler');

var debug = require('debug')('rest-auth-ldap:resources');

var router = express.Router();

var getAuthResponse = function (req, res, next) {
  function render(response) {
      return function (authToken) {
          debug(authToken);
          return response.json({
              success: true,
              authToken: authToken
          });
      };
  }

  return authService.authenticate(req.body.username, req.body.password)
                    .then(render(res))
                    .catch(generateErrorResponder(req, res, next));
};

router.route('/auth')
      .all(methodNotFound)
      .post(getAuthResponse);

module.exports = router;
