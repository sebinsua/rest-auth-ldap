'use strict';

// var Promise = require('bluebird');

var LdapService = require('./ldap');

var jwt = require('jsonwebtoken');

var config = require('../../config');

var fs = require('fs');

var certificate = fs.readFileSync(__dirname + '/../../cert/ldap.commons.hmpo.net.pem');
// var debug = require('debug')('rest-auth-ldap:services:auth');

function AuthService() {}

// TODO: See if I can get bunyan compatible logging in ldapjs setup.

AuthService.prototype.authenticate = function (username, password) {
  var authenticateUser = function authenticateUser(username, password) {
    var ldapService = new LdapService({
      server: {
        url: config.LDAP_SERVER_URL,
        timeout: 15 * 1000
        ,
        tlsOptions: {
          // See: http://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
          // rejectUnauthorized: false,
          ca: certificate
        }
      },
      base: 'dc=hmpo,dc=net',
      search: {
        filter: 'cn=reporter-auth'
      }
    });

    return ldapService.authenticate(username, password);
  };

  var assignRoles = function (ldapAccount) {
    var authenticationResponse = {
      account: ldapAccount,
      roles: {}
    };
    return authenticationResponse;
  };

  var signAsTrusty = function (authenticationResponse) {
    // TODO: Use a private key instead of a shared secret.
    //       - The PEM encoded private key for RSA and ECDSA.
    //       See: http://stackoverflow.com/questions/5244129/use-rsa-private-key-to-generate-public-key
    //       Check to see if webpack can support crypto. Perhaps use browserify-crypto
    // TODO: Set the audience, subject and issuer.
    //       See: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef

    var sharedTrustySecret = config.SHARED_SECRET || 'some-secret';

    var payload = authenticationResponse;
    var authToken = jwt.sign(payload, sharedTrustySecret);

    var signedAuthenticationResponse = {
      authToken: authToken,
      roles: authenticationResponse.roles
    };

    return signedAuthenticationResponse;
  };

  return authenticateUser(username, password).
         then(assignRoles).
         then(signAsTrusty);
};

module.exports = new AuthService();
