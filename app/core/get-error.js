'use strict';

function getErrorWithCode(message, code) {
  var error = new Error(message);
  error.code = code || 'UNAUTHORIZED';
  return error;
}

module.exports = getErrorWithCode;
