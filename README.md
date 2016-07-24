# rest-auth-ldap
> [RESTful](http://en.wikipedia.org/wiki/Representational_state_transfer) API for authenticating against an LDAP server.

I found this on my machine from a couple of years ago. It worked back then but might not now: it doesn't have tests and I don't have an LDAP server so I can't be sure.

Either way, it might be a good start if you need a RESTful interface in front of an LDAP server.

Installation
------------

The [dependencies are defined](http://12factor.net/dependencies) in the [package.json](./package.json). The service also requires [PostgreSQL](http://www.postgresql.org/) accessible as [a backing service](http://12factor.net/backing-services).

```shell
$ git clone git@github.com:sebinsua/rest-auth-ldap.git;
$ npm install;
```

Configuration
-------------

There are multiple ways of configuring this service. It is configured by default based on the config stored in `config/defaults.json`, and this can be overridden by an config stored in `/etc/rest-auth-ldap/config.json`. However, this is not the recommended way to configure the app.

The recommended way of configuring the app is with [the 12 Factor way of passing in environment variables to the process when it starts](http://12factor.net/config). The environment variables that can be configured are the keys of the config object inside `config/defaults.json`.

Starting the service
--------------------

```shell
$ npm start;
```

Endpoints
---------

**Authentication**

```
POST /auth
{
  "username": "username",
  "password": "password",
  "applicationId": "some-app-identifier"
}
```

Should respond with 200, 401, 403 or 500 depending on the request given and the configuration of the service.

Testing
-------

```shell
$ npm install --dev;
$ npm test;
```
