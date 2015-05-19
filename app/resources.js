'use strict';

var express = require('express');

var methodNotFound = require('../lib/middlewares/method-not-found');

var authService = require('./services/auth');

var router = express.Router();

router.route('/auth')
      .all(methodNotFound)
      .get(authService.getAuthToken);

module.exports = router;
