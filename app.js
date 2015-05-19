#!/usr/bin/env node

'use strict';

var NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('./config');

// Configure the application depending on the current environment
// and the config that was loaded.
var app = require('./app/configure')(NODE_ENV, config),
    logger = app.get('logger');

logger.info('Starting rest-examiner-psn...');
app.listen(app.get('port'), function () {
    logger.info('Listening for requests on port ' + app.get('port') + '...');
});
