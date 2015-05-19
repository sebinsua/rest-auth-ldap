'use strict';

// var Promise = require('bluebird');

var LdapService = require('./ldap');

var jwt = require('jsonwebtoken');

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

  // TODO: Use a private key instead of a shared secret.
  //       - The PEM encoded private key for RSA and ECDSA.
  //       See: http://stackoverflow.com/questions/5244129/use-rsa-private-key-to-generate-public-key
  //       Check to see if webpack can support crypto. Perhaps use browserify-crypto
  // TODO: Set the audience, subject and issuer.
  //       See: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef
  // TODO: payload should be an object.
  // TODO: Create promises instead of using callbacks.

  var token = jwt.sign('some-data', 'some-secret');
  var found = jwt.verify(token, 'some-secret-fake');
  var and = jwt.decode(token, { complete: true });
  console.log(token);
  console.log(found);
  console.log(and);

  return authenticateUser;
};

module.exports = new AuthService();
