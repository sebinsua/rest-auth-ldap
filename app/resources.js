'use strict';

var express = require('express');

var AuthService = require('./services/auth');

var methodNotFound = require('../lib/middlewares/method-not-found');

var generateErrorResponder = require('./core/error-response-handler');

var config = require('../config');

var debug = require('debug')('rest-auth-ldap:resources');

var router = express.Router();

var getAuthToken = function (req, res, next) {
  function render(response) {
      return function (data) {
          debug(data);
          return response.json({
              success: true,
              data: data
          });
      };
  }

  var authService = new AuthService(config.ROLES);
  return authService.authenticate(req.body.username, req.body.password, req.body.applicationId)
                    .then(render(res))
                    .catch(generateErrorResponder(req, res, next));
};

var validateAuthToken = function (req, res, next) {
  function render(response) {
      return function (data) {
          debug(data);
          return response.json({
              success: true,
              data: data
          });
      };
  }

  var authService = new AuthService(config.ROLES);
  return authService.validate(req.body.authToken, req.body.applicationId)
                    .then(render(res))
                    .catch(generateErrorResponder(req, res, next));
};

router.route('/auth')
      .all(methodNotFound)
      .post(getAuthToken);

router.route('/validate-auth')
      .all(methodNotFound)
      .post(validateAuthToken);

module.exports = router;
