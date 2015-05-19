'use strict';

// var Promise = require('bluebird');

var LdapService = require('./ldap');

var config = require('../../config');

// var debug = require('debug')('rest-auth-ldap:services:auth');

function AuthService() {}

AuthService.prototype.getAuthToken = function (username, password) {
  var ldapService = new LdapService({
    server: {
      url: config.LDAP_SERVER_URL,
      timeout: 5 * 1000
    }
  });

  var authenticateUser = ldapService.authenticate(username, password);

  return authenticateUser;
};

module.exports = new AuthService();
