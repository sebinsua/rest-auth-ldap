'use strict';

var cors = require('cors'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    healthcheck = require('express-healthcheck'),
    morgan = require('morgan'),
    prop = require('ramda').prop;

var generateLogger = require('./core/logger'),
    assignId = require('../lib/middlewares/assign-id'),
    resourceNotFound = require('../lib/middlewares/resource-not-found'),
    errorHandler = require('../lib/middlewares/error-handler');

var resources = require('./resources');

var express = require('express');

module.exports = function (NODE_ENV, config) {
    var app = express();

    var logger = generateLogger(config);

    logger.info('Configuring...');

    app.set('env', NODE_ENV);
    app.set('port', config.SERVICE_PORT);
    app.set('logger', logger);
    app.enable('trust proxy');
    app.disable('x-powered-by');

    morgan.token('id', prop('id'));

    app.use(cors());
    app.use(assignId);
    app.use(morgan(':method :url :id - :status :res[content-length] :response-time ms',
            { stream: logger.stream }));
    app.use(bodyParser.json());
    app.use(compression());

    app.use(resources);
    app.use('/healthcheck', healthcheck());

    app.use('*', resourceNotFound);

    app.use(errorHandler(NODE_ENV));

    return app;
};
