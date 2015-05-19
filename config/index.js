'use strict';
/* eslint no-underscore-dangle: 0 */

var fs = require('fs'),
    path = require('path');

var R = require('ramda');

var CONFIG_PATH = '/etc/hmpo/rest-reporter-psn/config.json',
    defaultConfig = require('./default.json'),
    instanceConfig = fs.existsSync(CONFIG_PATH) ? require(CONFIG_PATH) : {},
    envConfig = R.pick(Object.keys(defaultConfig), process.env);

var config = R.mergeAll([defaultConfig, instanceConfig, envConfig]);

config.APP_ROOT = global.__root || path.resolve(__dirname, '../');

module.exports = config;
