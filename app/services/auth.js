'use strict';

var R = require('ramda');

var LdapService = require('./ldap');

var jwt = require('jsonwebtoken');

var config = require('../../config');
var getErrorWithCode = require('../core/get-error');

var fs = require('fs');
var path = require('path');

var certificate;
if (config.LDAP_CERTIFICATE_PATH) {
  certificate = fs.readFileSync(path.resolve(__dirname + '/../../', config.LDAP_CERTIFICATE_PATH));
}

var ldapUidTag = config.LDAP_UID_TAG || 'cn';

function AuthService (objectClassToRoles) {
  this.objectClassToRoles = objectClassToRoles;
}

AuthService.prototype.authenticate = function (username, password, applicationId) {
  var authenticateUserWithLdap = function authenticateUserWithLdap (username, password) {
    var ldapService = new LdapService({
      server: {
        url: config.LDAP_SERVER_URL,
        timeout: config.LDAP_TIMEOUT || 15 * 1000,
        tlsOptions: {
          // See: http://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
          rejectUnauthorized: certificate === undefined ? false : true,
          ca: certificate
        }
      },
      base: config.LDAP_BASE,
      uidTag: ldapUidTag,
      search: {
        filter: ldapUidTag + '=' + ('$' + ldapUidTag)
      }
    });

    return ldapService.authenticate(username, password);
  };

  var assignRolesBasedOnObjectClass = function assignRolesBasedOnObjectClass(objectClassToRoles) {
    var pickKeys = R.pick([ldapUidTag, 'dn', 'objectClass']);
    var toRoles = R.pipe(R.map(R.flip(R.prop)(objectClassToRoles)), R.filter(R.identity), R.flatten);

    return function assignRoles (ldapAccount) {
      var cn = ldapAccount[ldapUidTag];
      var objectClasses = ldapAccount['objectClass'];

      var authenticationResponse = {
        account: pickKeys(ldapAccount),
        roles: toRoles(objectClasses)
      };

      return authenticationResponse;
    };
  };

  var checkRolesForLoginRights = function checkRolesForLoginRights (applicationId) {
    applicationId = applicationId || 'all';
    var applicationLogin = applicationId + ':login';
    var allApplicationLogin = 'all:login';
    return function testForApplicationLogin (authenticationResponse) {
      var isApplicationLoginNotAllowed = authenticationResponse.roles.indexOf(applicationLogin) === -1;
      var isAllApplicationLoginNotAllowed = authenticationResponse.roles.indexOf(allApplicationLogin) === -1
      if (isApplicationLoginNotAllowed && isAllApplicationLoginNotAllowed) {
        throw getErrorWithCode('Unauthorised access: for this application.');
      }

      return authenticationResponse;
    };
  };

  var signAsTrusty = function signAsTrusty (authenticationResponse) {
    // Note: Might need to use a private key instead of a shared secret, if we need clients to read payload.
    //       See: http://stackoverflow.com/questions/5244129/use-rsa-private-key-to-generate-public-key
    //       If so, check to see how webpack can support crypto. Perhaps use browserify-crypto.

    var secret = config.SHARED_SECRET;

    var payload = authenticationResponse;
    var authToken = jwt.sign(payload, secret, {
      expiresInMinutes: config.JWT_EXPIRY_MINUTES || 60 * 24,
      audience: config.JWT_AUDIENCE,
      subject: authenticationResponse.account[ldapUidTag],
      issuer: config.JWT_ISSUER
    });

    var signedAuthenticationResponse = {
      authToken: authToken,
      username: authenticationResponse.account[ldapUidTag],
      roles: authenticationResponse.roles
    };

    return signedAuthenticationResponse;
  };

  var objectClassToRoles = this.objectClassToRoles;

  return authenticateUserWithLdap(username, password).
         then(assignRolesBasedOnObjectClass(objectClassToRoles)).
         then(checkRolesForLoginRights(applicationId)).
         then(signAsTrusty);
};

module.exports = AuthService;
