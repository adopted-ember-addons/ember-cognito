# ember-cognito
## An authenticator and library for using ember-simple-auth and Amazon Cognito

[![Build Status](https://travis-ci.org/paulcwatts/ember-cognito.svg?branch=master)](https://travis-ci.org/paulcwatts/ember-cognito)
[![Code Climate](https://codeclimate.com/github/paulcwatts/ember-cognito/badges/gpa.svg)](https://codeclimate.com/github/paulcwatts/ember-cognito)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cognito.svg)](https://emberobserver.com/addons/ember-cognito)
[![Test Coverage](https://codeclimate.com/github/paulcwatts/ember-cognito/badges/coverage.svg)](https://codeclimate.com/github/paulcwatts/ember-cognito/coverage)
[![npm version](https://badge.fury.io/js/ember-cognito.svg)](https://badge.fury.io/js/ember-cognito)
[![Greenkeeper badge](https://badges.greenkeeper.io/paulcwatts/ember-cognito.svg)](https://greenkeeper.io/)

Ember Cognito is an Ember Addon that integrates [ember-simple-auth](https://github.com/simplabs/ember-simple-auth/) 
with [Amazon Cognito](https://aws.amazon.com/cognito/) User Pools. 

ember-simple-auth is a lightweight library for implementing authentication/authorization in Ember.js. 
Amazon Cognito is a managed authentication system for mobile and web apps on Amazon Web Services.

ember-cognito implements an ember-simple-auth custom authenticator that can be used to authenticate with 
a Cognito User Pool. It also provides some helper classes that convert Cognito's callback-oriented API to
a promise-oriented API.

## Installation

Install as a standard Ember Addon:

* `ember install ember-cognito`

## Configure

In your `config/environment.js`  file:

```js
var ENV = {
  // ..
  cognito: {
    poolId: '<your Cognito User Pool ID>',
    clientId: '<your Cognito App Client ID>',
  }
};
```

Note that the Cognito JavaScript SDK requires that your App be created *without* a Client Secret.

## Optional Configuration

You can specify these optional configuration options to the above configuration hash:

* `autoRefreshSession`. Cognito access tokens are only valid for an hour. By default, this addon will
refresh expired sessions on application startup. Setting `autoRefreshSession` to `true` will enable a timer
that will automatically refresh the Cognito session when it expires.

## Usage

### Cognito Authenticator

The Cognito Authenticator authenticates an ember-simple-auth session with Amazon Cognito. It overwrites
the Amazon SDK's storage mechanism (which is hardcoded to use localStorage) to instead store the authentication
data in ember-simple-auth's session-store. This makes it easier to integrate Cognito in Ember unit tests.

You will call the authenticator just as you would a normal authenticator:

```js
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service('session'),

  actions: {
    authenticate() {
      let { username, password } = this.getProperties('username', 'password');
      let credentials = { 
        username: username,
        password: password
      };
      this.get('session').authenticate('authenticator:cognito', credentials).then((cognitoUserSession) => {
        // Successfully authenticated!  
      }).catch((error) => {
        this.set('errorMessage', error.message || error);
      });
    }
  }
});
```

### Integrating with an Authorizer

The Cognito Authenticator will put the Cognito ID token in the `access_token` property in the session's
`authenticated` data. This means integrating with an Authorizer such as the OAuth2 Bearer requires no 
special configuration.

### Cognito SDK Vendor Shim

ember-cognito provides a vendor shim that allows you to import [Cognito Identity SDK's](https://github.com/aws/amazon-cognito-identity-js/) 
classes using ES modules:

```js
 import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';
```

### CognitoUser

[CognitoUser](https://github.com/paulcwatts/ember-cognito/blob/master/addon/utils/cognito-user.js) is a helper 
Ember object that provides promisified versions of the Cognito Identity SDK's callback methods.
For instance, you can take this code from the Cognito SDK:

```js
import { CognitoUser } from 'amazon-cognito-identity-js';

cognitoUser.getUserAttributes(function(err, result) {
  if (err) {
    alert(err);
    return;
  }
  for (let i = 0; i < result.length; i++) {
    console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
  }
});
```

And rewrite it to use Promises and other ES2015 goodness:

```js
import { CognitoUser } from 'ember-cognito/utils/cognito-user';

cognitoUser.getUserAttributes().then((userAttributes) => {
  userAttributes.forEach((attr) => {
    console.log(`attribute ${attr.getName()} has value ${attr.getValue()}`);
  });
}).catch((err) => {
  alert(err);
});
```

### CognitoService

The Cognito service allows you to access the currently authenticated `CognitoUser` object. 
For instance, if you use a `current-user` service using the 
[ember-simple-auth guide](https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md), 
you can use the Cognito Service to fetch user attributes:

```js
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { resolve } from 'rsvp';

export default Service.extend({
  session: service(),
  cognito: service(),
  cognitoUser: readOnly('cognito.user'),
  username: readOnly('cognitoUser.username'),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('cognitoUser').getUserAttributes().then((userAttributes) => {
        userAttributes.forEach((attr) => {
          this.set(attr.getName(), attr.getValue());
        });
      });
    } else {
      return resolve();
    }
  }
});
```

See [the dummy app](https://github.com/paulcwatts/ember-cognito/blob/master/tests/dummy/app/services/current-user.js)
for an example of this in action.

#### Advanced Configuration

If you don't want to specify the Pool ID and Client ID in the Ember environment, you can override the CognitoService
in your own app and provide the configuration there. 

```js
// app/services/cognito.js
import CognitoService from 'ember-cognito/services/cognito';

export default CognitoService.extend({
  poolId: '<my pool ID>',
  clientId: '<my client ID>'
});
```

In this case, you can have the properties be computed or retrieved through some dynamic mechanism.

## Testing

ember-cognito provides some helpers and utilities that make it easier to work with Cognito in tests.

### MockUser

`MockUser` can be used to mock `CognitoUser` so you don't make Cognito calls in tests. 

```js
import { MockUser } from '<app>/tests/utils/ember-cognito';

let mockUser = MockUser.create({
  username: 'testuser',
  userAttributes: [
    { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
    { name: 'first_name', value: 'Steve' }
  ]
});
```

This can be used in unit or integration tests where a `CognitoUser` is needed.

### mockCognitoUser

In acceptance tests, you can use ember-simple-auth's `authenticateSession` to create a user, but
you will may also need to mock the user on the Cognito service. You can do this using `mockCognitoUser`:

```js
import { authenticateSession } from '<app>/tests/helpers/ember-simple-auth';
import { mockCognitoUser } from '<app>/tests/helpers/ember-cognito';

test('authenticated route', function(assert) {
  authenticateSession(this.application);
  mockCognitoUser(this.application, {
    username: 'testuser',
    userAttributes: [
      { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
      { name: 'email', value: 'testuser@gmail.com' }
    ]
  });
  // ..
});
```

See [the dummy app](https://github.com/paulcwatts/ember-cognito/blob/master/tests/acceptance/index-test.js)
for an example of this type of test.

If your app is using `ember-cli-qunit` 4.2.0 or greater, consider migrating to the [modern testing syntax](https://dockyard.com/blog/2018/01/11/modern-ember-testing).
In this case, helpers can be imported from the `ember-cognito` namespace, and can be used
in any time of test (unit, integration, acceptance).


```js
import { authenticateSession } from 'ember-simple-auth/test-support';
import { mockCognitoUser } from 'ember-cognito/test-support';

module('Acceptance | authenticated route', function(hooks) {
  test('authenticated route', async function(assert) {
    await authenticateSession();
    await mockCognitoUser({
      username: 'testuser'
      // userAttributes...
    });
    // No helper necessary to get the authenticator!
    let authenticator = this.owner.lookup('authenticator:cognito');
    
  });
});
```

## Support

ember-cognito is tested on Ember versions 2.12, 2.16 and 2.17+.
