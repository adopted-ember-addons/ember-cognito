# ember-cognito
## An authenticator and library for using ember-simple-auth and AWS Amplify/Cognito

[![Build Status](https://travis-ci.org/paulcwatts/ember-cognito.svg?branch=master)](https://travis-ci.org/paulcwatts/ember-cognito)
[![Ember Observer Score](https://emberobserver.com/badges/ember-cognito.svg)](https://emberobserver.com/addons/ember-cognito)
[![npm version](https://badge.fury.io/js/ember-cognito.svg)](https://badge.fury.io/js/ember-cognito)

Ember Cognito is an Ember Addon that integrates 
[ember-simple-auth](https://github.com/simplabs/ember-simple-auth/) 
with [AWS Amplify](https://aws-amplify.github.io/docs/) and 
[AWS Cognito](https://aws.amazon.com/cognito/) User Pools. 

ember-simple-auth is a lightweight library for implementing authentication/authorization 
in Ember.js. AWS Amplify is a client framework, developed by Amazon, which uses Amazon 
Cognito as a managed authentication system for mobile and web apps on Amazon Web Services.

ember-cognito implements an ember-simple-auth custom authenticator that can be used 
in an AWS Amplify application, or any Ember application, to authenticate with 
a Cognito User Pool. 

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

Note that the Cognito JavaScript SDK requires that your App be created *without* a 
Client Secret.

## Optional Configuration

You can specify these optional configuration options to the above configuration hash:

* `autoRefreshSession`. Cognito access tokens are only valid for an hour. By default, 
this addon will refresh expired sessions on application startup. 
Setting `autoRefreshSession` to `true` will enable a timer that will automatically 
refresh the Cognito session when it expires.

* `authenticationFlowType`. The authentication flow type that should be used. 
Default value: `USER_SRP_AUTH`
Allowed values: `USER_SRP_AUTH | USER_PASSWORD_AUTH`
More details - [Auth Flow](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_InitiateAuth.html?shortFooter=true#API_InitiateAuth_RequestSyntax)

## Usage

### Cognito Authenticator

The Cognito Authenticator authenticates an ember-simple-auth session with 
Amplify/Cognito:

```js
import Component from '@ember/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginComponent extends Component {
  @service session;
  
  @action
  async authenticate() {
    const { username, password } = this;
    const credentials = { username, password };
    try {
      await this.session.authenticate('authenticator:cognito', credentials);
    } catch (error) {
      this.set('errorMessage', error.message || error);
    }
  }
}
```

#### Integrating with an Ember Data Adapter

The Cognito Authenticator will put the Cognito ID token in the `access_token` property in the session's
`authenticated` data. This means integrating with ember-simple-auth's 
[Ember Data Adapter Mixin](https://github.com/simplabs/ember-simple-auth/blob/master/addon/mixins/data-adapter-mixin.js)
requires no special configuration.


### Cognito Service

The addon provides a `cognito` service that provides some helpers to access the 
Amplify auth object. The service provides access to the following Amplify/auth methods:

* `signUp(username, password, attributes, validationData)`
* `confirmSignUp(username, code, options)`
* `resendSignUp(username)`
* `forgotPassword(username)`
* `forgotPasswordSubmit(username, code, newPassword)`

It also provides a helper to quickly access the current user's Cognito ID token:

* `getIdToken()`

#### Cognito User

The Cognito service allows you to access the currently authenticated `CognitoUser` 
object, along with the following helper methods:

* `changePassword(oldPassword, newPassword)`
* `deleteAttributes(attributeList)`
* `deleteUser()`
* `getSession()`
* `getUserAttributes()`
* `getUserAttributesHash()`
* `signOut()`
* `updateAttributes()`
* `verifyAttribute()`
* `getGroups()`

If you use a `current-user` service using the 
[ember-simple-auth guide](https://github.com/simplabs/ember-simple-auth/blob/master/guides/managing-current-user.md), 
you can use the Cognito User to fetch user attributes:

```js
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';

export default class CurrentUserService extends Service {
  @service session;
  @service cognito;
  @readOnly('cognito.user') cognitoUser;
  @readOnly('cognitoUser.username') username;
  
  async load() {
    if (this.session.isAuthenticated) {
      const userAttributes = await this.cognitoUser.getUserAttributes();
      userAttributes.forEach((attr) => {
        this.set(attr.getName(), attr.getValue());
      });
    }
  }
}
```

You can see examples of usages of these API methods in the 
[full-featured dummy app](https://github.com/paulcwatts/ember-cognito/blob/master/tests/dummy/app).


#### Advanced Configuration

If you don't want to specify the Pool ID and Client ID in the Ember environment, you 
can override the CognitoService in your own app and provide the configuration there. 

```js
// app/services/cognito.js
import BaseCognitoService from 'ember-cognito/services/cognito';

export default class CognitoService extends BaseCognitoService {
  poolId = '<my pool ID>';
  clientId = '<my client ID>;
}
```

In this case, you can have the properties be computed or retrieved through some dynamic 
mechanism.

## Testing

ember-cognito provides some helpers and utilities that make it easier to work with 
Cognito in tests.

### mockCognitoUser

In acceptance tests, you can use ember-simple-auth's `authenticateSession` to create a 
user, but you may also need to mock user attributes on the Cognito service. You can do 
this using `mockCognitoUser`:

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
    const authenticator = this.owner.lookup('authenticator:cognito');
    // Rest of the test
  });
});
```

### mockAuth

In some cases, you may want to mock the Amplify auth object to test authentication
scenarios. You can use the `mockAuth` helper to add your own mock class to
stub certain Amplify functions in tests:

```js
import { mockAuth, MockAuth } from 'ember-cognito/test-support';

module('Acceptance | login', function(hooks) {
  setupApplicationTest(hooks);
  
  test('login failure', async function(assert) {
    await mockAuth(MockAuth.extend({
      signIn() {
        return reject({ message: 'Username or password incorrect.' });
      }
    }));
     
    // Attempt to login, 
    await visit('/login');
    await fillIn('#username', 'testuser');
    await fillIn('#password', 'password');
    await click('[type=submit]');
  
    assert.dom('[data-test-error]').hasText('Username or password incorrect.');
  });
});
```

## Dummy App

The [dummy app](https://github.com/paulcwatts/ember-cognito/blob/master/tests/dummy/app)
includes many use cases for you to see this addon in action, including new user sign up,
login, logout, and updating/verifying user attributes.

## Support

* Ember versions 3.4+
* AWS Amplify 1.x
