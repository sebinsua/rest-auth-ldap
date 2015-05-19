rest-auth-ldap
==============

[RESTful](http://en.wikipedia.org/wiki/Representational_state_transfer) API for authenticating against an LDAP server.

Installation
------------

The [dependencies are defined](http://12factor.net/dependencies) in the [package.json](https://git.pex.hmpo.net/hmpo-lsr/rest-examiner-psn/blob/master/package.json). The service also requires [PostgreSQL](http://www.postgresql.org/) accessible as [a backing service](http://12factor.net/backing-services).

```shell
$ git clone git@git.commons.hmpo.net:hmpo-lsr/rest-auth-ldap.git;
$ npm install;
```

Configuration
-------------

There are multiple ways of configuring this service. It is configured by default based on the config stored in `config/defaults.json`, and this can be overriden by an config stored in `/etc/hmpo-lsr/rest-auth-ldap/config.json`. However, this is not the recommended way to configure the app.

The recommended way of configuring the app is with [the 12 Factor way of passing in environment variables to the process when it starts](http://12factor.net/config). The environment variables that can be configured are the keys of the config object inside `config/defaults.json`.

Starting the service
--------------------

```shell
$ npm start;
```

Endpoints
---------

*TODO*

Testing
-------

```shell
$ npm install --dev;
$ npm test;
```
