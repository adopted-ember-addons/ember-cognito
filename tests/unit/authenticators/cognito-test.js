import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { moduleFor } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';

moduleFor('authenticator:cognito', 'Unit | Authenticator | cognito', {
  needs: ['service:cognito'],

  beforeEach() {
    this.stubUserMethod = function(service, method, fn) {
      this.stub(service, '_stubUser').callsFake((user) => {
        this.user = user;
        this.stub(user, method).callsFake(fn);
        return user;
      });
    };
    this.stubUserMethods = function(service, fn) {
      this.stub(service, '_stubUser').callsFake((user) => {
        this.user = user;
        fn(user);
        return user;
      });
    };
  }
});

function newSession() {
  return new CognitoUserSession({
    IdToken: new CognitoIdToken({ IdToken: 'xxxx' }),
    RefreshToken: new CognitoRefreshToken({ RefreshToken: 'yyyy' }),
    AccessToken: new CognitoAccessToken({ AccessToken: 'yyyy' })
  });
}

test('config is set correctly', function(assert) {
  let service = this.subject();
  assert.equal(service.get('poolId'), 'us-east-1_TEST');
  assert.equal(service.get('clientId'), 'TEST');
});

test('restore', function(assert) {
  let service = this.subject();

  this.stubUserMethod(service, 'getSession', (callback) => {
    let session = newSession();
    this.stub(session, 'isValid').returns(true);
    callback(null, session);
  });

  let data = {
    poolId: 'us-east-1_TEST',
    clientId: 'TEST',
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  };
  return service.restore(data).then((resolvedData) => {
    assert.deepEqual(resolvedData, data, 'The resolved data is correct.');
    assert.ok(service.get('cognito.user'), 'The cognito service user is populated.');
    assert.equal(service.get('cognito.user.username'), 'testuser', 'The username is set correctly.');
  });
});

test('restore no current user', function(assert) {
  let service = this.subject();
  return service.restore({ poolId: 'us-east-1_TEST', clientId: 'TEST' }).then(() => {
    assert.ok(false, 'Should not resolve.');
  }).catch((err) => {
    assert.deepEqual(err, 'no current user', 'Restore rejects');
  });
});

test('restore session invalid', function(assert) {
  let service = this.subject();

  this.stubUserMethod(service, 'getSession', (callback) => {
    let session = newSession();
    this.stub(session, 'isValid').returns(false);
    callback(null, session);
  });

  let data = {
    poolId: 'us-east-1_TEST',
    clientId: 'TEST',
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  };
  return service.restore(data).then(() => {
    assert.ok(false, 'Should not resolve.');
  }).catch((err) => {
    assert.deepEqual(err, 'session is invalid', 'Restore rejects');
  });
});

test('authenticateUser', function(assert) {
  /* eslint-disable camelcase */
  let service = this.subject();

  this.stubUserMethod(service, 'authenticateUser', (authDetails, callbacks) => {
    // Set something in the pools's storage just so it makes its way into the data
    this.user.pool.storage.setItem('Cognito.StorageItem', 'test');
    callbacks.onSuccess(newSession());
  });

  return service.authenticate({ username: 'testuser', password: 'password' }).then((data) => {
    assert.deepEqual(data,  {
      access_token: 'xxxx',
      clientId: 'TEST',
      poolId: 'us-east-1_TEST',
      'Cognito.StorageItem': 'test'
    });
    assert.ok(service.get('cognito.user'), 'The cognito service user is populated.');
    assert.equal(service.get('cognito.user.username'), 'testuser', 'The username is set correctly.');
  });
});

test('authenticateUser, failure', function(assert) {
  let service = this.subject();

  this.stubUserMethod(service, 'authenticateUser', (authDetails, callbacks) => {
    callbacks.onFailure({ message: 'Username or password incorrect.' });
  });

  return service.authenticate({ username: 'testuser', password: 'password' }).then(() => {
    assert.ok(false, 'Should not resolve');
  }).catch((err) => {
    assert.equal(err.message, 'Username or password incorrect.');
  });
});

test('authenticateUser, newPasswordRequired', function(assert) {
  let service = this.subject();

  this.stubUserMethods(service, (user) => {
    this.stub(user, 'authenticateUser').callsFake((authDetails, callbacks) => {
      callbacks.newPasswordRequired({ sub: 'xxxx', email_verified: false });
    });
    this.stub(user, 'completeNewPasswordChallenge').callsFake((password, userAttributs, callbacks) => {
      this.user.pool.storage.setItem('Cognito.StorageItem', 'test');
      callbacks.onSuccess(newSession());
    });
  });

  return service.authenticate({ username: 'testuser', password: 'password' }).then(() => {
    assert.ok(false, 'Should not resolve');
  }).catch((err) => {
    assert.equal(err.state.name, 'newPasswordRequired');
    assert.deepEqual(err.state.userAttributes, { sub: 'xxxx' });

    // Call authenticate again with the state and the new password.
    return service.authenticate({ password: 'newPassword', state: err.state });
  }).then((data) => {
    assert.deepEqual(data,  {
      access_token: 'xxxx',
      clientId: 'TEST',
      poolId: 'us-east-1_TEST',
      'Cognito.StorageItem': 'test'
    });
    assert.ok(service.get('cognito.user'), 'The cognito service user is populated.');
    assert.equal(service.get('cognito.user.username'), 'testuser', 'The username is set correctly.');
  });
});

test('authenticateUser, newPasswordRequired failure', function(assert) {
  let service = this.subject();

  this.stubUserMethods(service, (user) => {
    this.stub(user, 'authenticateUser').callsFake((authDetails, callbacks) => {
      callbacks.newPasswordRequired({ sub: 'xxxx', email_verified: false });
    });
    this.stub(user, 'completeNewPasswordChallenge').callsFake((password, userAttributs, callbacks) => {
      callbacks.onFailure({ message: 'Invalid password.' });
    });
  });

  return service.authenticate({ username: 'testuser', password: 'password' }).then(() => {
    assert.ok(false, 'Should not resolve');
  }).catch((err) => {
    assert.equal(err.state.name, 'newPasswordRequired');
    assert.deepEqual(err.state.userAttributes, { sub: 'xxxx' });

    // Call authenticate again with the state and the new password.
    return service.authenticate({ password: 'newPassword', state: err.state });
  }).then(() => {
    assert.ok(false, 'Should not resolve');
  }).catch((err) => {
    assert.equal(err.message, 'Invalid password.');
  });
});

test('invalidate', function(assert) {
  let data = {
    poolId: 'us-east-1_TEST',
    clientId: 'TEST',
    'CognitoIdentityServiceProvider.TEST.testuser.idToken': 'aaaaa',
    'CognitoIdentityServiceProvider.TEST.testuser.accessToken': 'bbbbb',
    'CognitoIdentityServiceProvider.TEST.testuser.refreshToken': 'ccccc',
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  };
  let service = this.subject();
  return service.invalidate(data).then((resolvedData) => {
    assert.deepEqual(data, resolvedData);
  });
});
