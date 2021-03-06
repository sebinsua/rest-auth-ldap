'use strict';
/* eslint no-underscore-dangle: 0 */

var fs = require('fs'),
    path = require('path');

var R = require('ramda');

var CONFIG_PATH = '/etc/rest-auth-ldap/config.json',
    defaultConfig = require('./default.json'),
    instanceConfig = fs.existsSync(CONFIG_PATH) ? require(CONFIG_PATH) : {},
    envConfig = R.pick(Object.keys(defaultConfig), process.env);

var config = R.mergeAll([defaultConfig, instanceConfig, envConfig]);

config.APP_ROOT = path.resolve(__dirname, '../');
config.ROLES = require('./object-classes-to-roles');

module.exports = config;
