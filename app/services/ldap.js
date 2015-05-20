'use strict';

var Promise = require('bluebird');
var R = require('ramda');

var ldap = require('ldapjs');

var debug = require('debug')('rest-auth-ldap:services:ldap');

function getErrorWithCode(message, code) {
  var error = new Error(message);
  error.code = code || 'UNAUTHORIZED';
  return error;
}

/*
 * We authenticate requests by delegating to the given ldap server using the openldap protocol.
 *
 * Options:
 *   - `server`  ldap server connection options - http://ldapjs.org/client.html#create-a-client
 *   - `base`    the base DN to search against
 *   - `search`  an object of containing search options - http://ldapjs.org/client.html#search
 * E.g.
 * {
 *   server: {
 *     url: 'ldap://0.0.0.0:1389'
 *   },
 *   base: 'cn=users,dc=example,dc=local',
 *   search: {
 *     filter: '(&(l=Seattle)(email=*@foo.com))',
 *   }
 * }
 */
function LdapService (options) {
  options = options || {};
  var defaultOptions = {
    server: {
      url: ''
    },
    base: '',
    search: {
      filter: ''
    },
    authOnly: false,
    authMode: 1,   // 0 win, 1 Unix (linux, Solaris, ...)
    uidTag: 'uid' // Linux OpenLDAP 'uid', Sun Solaris 'cn'
  };

  this.options = R.merge(defaultOptions, options);
}

/**
 * Authenticate request by binding to LDAP server, and then searching for the user entry.
 *
 * Command line LDAP bind and search examples:
 * - Windows with Active Directory: ldapsearch -H ldap://192.168.1.17:389 -D XXX -w YYY -b dc=example,dc=local objectclass=*
 * - Linux/Sun Solaris with OpenLDAP: ldapsearch -H ldap://192.168.1.16:389 -D cn=XXX,dc=example,dc=local -w YYY -b dc=example,dc=local objectclass=*
 *
 */
LdapService.prototype.authenticate = function (username, password) {
  var self = this;

  return new Promise(function (resolve, reject) {
    if (!username || !password) {
      return reject(getErrorWithCode('Unauthorised access attempt', 'UNAUTHORIZED'));
    }

    // Create the client on every auth attempt the LDAP server can close the connection
    var client = ldap.createClient(self.options.server);

    /*
    if (self.options.authMode === 1) {
      var base = self.options.base;
      if (typeof base !== 'string') {
        base = base.join(',');
      }
      username = self.options.uidTag + '=' + username + ',' + base;
    }
    */

    // TODO: username used to the be the first argument, and password the second
    console.log(username);
    console.log(password);
    client.bind(username, password, function (err) {
      if (err) {
        debug('(EE) [ldapjs] LDAP error:', err.stack);
        return reject(getErrorWithCode('Forbidden access attempt', 'FORBIDDEN'));
      }

      if (self.options.authOnly) {
        debug('(II) [ldapjs] auth success:', username);
        resolve({
          uid: username
        });
      } else {
        var dn = username;
        if (self.options.authMode !== 1) {
          // Add the dc from the username if not already in the configuration
          if(typeof self.options.base !== 'string'){
            var nameSplit = username.split('\\');
            var name = nameSplit[1];
            var dc = 'dc=' + nameSplit[0].toLowerCase();

            dn = self.options.base.slice();
            if (self.options.base.indexOf(dc) === -1) {
              dn.splice(0, 0, dc);
            }
            dn = dn.join(',');
          } else {
            dn = self.options.base;
          }
        }

        // Create copy of the search object so we don't overwrite it
        var search = Object.create(self.options.search);
        // Replace placeholder name
        search.filter = search.filter.replace(/\$uid\$/, name);
        console.log(search);
        client.search(dn, search, function (err, res) {
          if (err) {
            debug('(EE) [ldapjs] LDAP error:', err.stack);
            return reject(getErrorWithCode('Forbidden access attempt', 'FORBIDDEN'));
          }

          res.on('searchEntry', function (entry) {
            var profile = entry.object;

            // There used to be some verification here, but I removed it.
            return resolve(profile);
          });

          res.on('error', function (err) {
            debug('(EE) [ldapjs] Network error:', err.stack);
            return reject(getErrorWithCode(err.message, 'UNAUTHORIZED'));
          });

          res.on('end', function (result) {
            if (result.status !== 0) {
              debug('(EE) [ldapjs] Result not OK:', result);
              return reject(getErrorWithCode('Unauthorised access attempt with status: ' + result.status, 'UNAUTHORIZED'));
            }
          });

        });
      }
    });

  });
};

module.exports = LdapService;
