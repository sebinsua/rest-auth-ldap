'use strict';

var R = require('ramda');

module.exports = function methodNotFound(req, res, next) {
    var hasMethod = req.route.methods[req.method.toLowerCase()];
    if (!hasMethod) {
        // See: https://tools.ietf.org/html/rfc2616#page-66
        var methodsAllowed = R.pipe(
            Object.keys,
            R.filter(R.not(R.eq('_all'))),
            R.map(R.func('toUpperCase'))
        );

        var computedMethodsAllowed = methodsAllowed(req.route.methods);
        res.set('Allow', computedMethodsAllowed.join(', '));

        var error = new Error('Resource does not allow this method.');
        error.status = 405;
        error.methodsAllowed = computedMethodsAllowed;

        return next(error);
    } else {
        return next();
    }
};
