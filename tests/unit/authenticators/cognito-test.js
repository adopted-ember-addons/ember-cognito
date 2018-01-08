import { set, get } from '@ember/object';
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import { moduleFor } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { skip } from 'qunit';
import { MockUser } from '../../utils/ember-cognito';

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

function newSession({ idToken, refreshToken, accessToken } = { idToken: 'xxxx', refreshToken: 'yyyy', accessToken: 'yyyy' }) {
  return new CognitoUserSession({
    IdToken: new CognitoIdToken({ IdToken: idToken }),
    RefreshToken: new CognitoRefreshToken({ RefreshToken: refreshToken }),
    AccessToken: new CognitoAccessToken({ AccessToken: accessToken })
  });
}

// Makes a JWT token from a payload
function makeToken(payload) {
  // The only thing the SDK ever reads is the payload, not the header.
  return `header.${btoa(JSON.stringify(payload))}`;
}

test('config is set correctly', function(assert) {
  let service = this.subject();
  assert.equal(get(service, 'poolId'), 'us-east-1_TEST');
  assert.equal(get(service, 'clientId'), 'TEST');
});

test('restore', async function(assert) {
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
  let resolvedData = await service.restore(data);
  assert.deepEqual(resolvedData, data, 'The resolved data is correct.');
  assert.ok(get(service, 'cognito.user'), 'The cognito service user is populated.');
  assert.equal(get(service, 'cognito.user.username'), 'testuser', 'The username is set correctly.');
});

skip('restore, refresh session', async function(assert) {
  /* eslint-disable camelcase */
  //
  // This digs deeper into the Cognito SDK to test that we reset our own access_token property
  // correctly on session refresh.
  //
  const now = Math.floor(new Date() / 1000);
  const oldIdToken = makeToken({ exp: 1492032752 });
  const oldAccessToken = makeToken({ exp: 1492032752 });
  const newIdToken = makeToken({ exp: now + 3600 });
  const newAccessToken = makeToken({ exp: now + 3600 });
  const refreshToken = 'xxxxrefresh';

  let service = this.subject();
  this.stub(service, '_stubUser').callsFake((user) => {
    this.stub(user.client, 'makeUnauthenticatedRequest').callsFake((request, params, callback) => {
      assert.equal(request, 'initiateAuth');
      assert.deepEqual(params, {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          DEVICE_KEY: undefined,
          REFRESH_TOKEN: 'xxxxrefresh'
        },
        ClientId: 'TEST'
      });
      callback(null, {
        AuthenticationResult: {
          AccessToken: newAccessToken,
          ExpiresIn: 3600,
          IdToken: newIdToken,
          TokenType: 'Bearer'
        },
        ChallengeParameters: {}
      });
    });
    return user;
  });

  let data = {
    authenticator: 'authenticator:cognito',
    access_token: oldIdToken,
    poolId: 'us-east-1_TEST',
    clientId: 'TEST',
    'CognitoIdentityServiceProvider.TEST.testuser.idToken': oldIdToken,
    'CognitoIdentityServiceProvider.TEST.testuser.accessToken': oldAccessToken,
    'CognitoIdentityServiceProvider.TEST.testuser.refreshToken': refreshToken,
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  };

  let resolvedData = await service.restore(data);
  assert.deepEqual(resolvedData, {
    authenticator: 'authenticator:cognito',
    access_token: newAccessToken,
    poolId: 'us-east-1_TEST',
    clientId: 'TEST',
    'CognitoIdentityServiceProvider.TEST.testuser.idToken': newIdToken,
    'CognitoIdentityServiceProvider.TEST.testuser.accessToken': newAccessToken,
    'CognitoIdentityServiceProvider.TEST.testuser.refreshToken': refreshToken,
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  });
});

test('restore no current user', async function(assert) {
  let service = this.subject();
  try {
    await service.restore({ poolId: 'us-east-1_TEST', clientId: 'TEST' });
    assert.ok(false, 'Should not resolve.');
  } catch (err) {
    assert.deepEqual(err, 'no current user', 'Restore rejects');
  }
});

test('restore session invalid', async function(assert) {
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
  try {
    await service.restore(data);
    assert.ok(false, 'Should not resolve.');
  } catch (err) {
    assert.deepEqual(err, 'session is invalid', 'Restore rejects');
  }
});

test('authenticateUser', async function(assert) {
  /* eslint-disable camelcase */
  let service = this.subject();

  this.stubUserMethod(service, 'authenticateUser', (authDetails, callbacks) => {
    // Set something in the pools's storage just so it makes its way into the data
    this.user.pool.storage.setItem('Cognito.StorageItem', 'test');
    callbacks.onSuccess(newSession());
  });

  let data = await service.authenticate({ username: 'testuser', password: 'password' });
  assert.deepEqual(data,  {
    access_token: 'xxxx',
    clientId: 'TEST',
    poolId: 'us-east-1_TEST',
    'Cognito.StorageItem': 'test'
  });
  assert.ok(get(service, 'cognito.user'), 'The cognito service user is populated.');
  assert.equal(get(service, 'cognito.user.username'), 'testuser', 'The username is set correctly.');
});

test('authenticateUser, failure', async function(assert) {
  let service = this.subject();

  this.stubUserMethod(service, 'authenticateUser', (authDetails, callbacks) => {
    callbacks.onFailure({ message: 'Username or password incorrect.' });
  });

  try {
    await service.authenticate({ username: 'testuser', password: 'password' });
    assert.ok(false, 'Should not resolve');
  } catch (err) {
    assert.equal(err.message, 'Username or password incorrect.');
  }
});

test('authenticateUser, newPasswordRequired', async function(assert) {
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

  let state;
  try {
    await service.authenticate({ username: 'testuser', password: 'password' });
    assert.ok(false, 'Should not resolve');
  } catch (err) {
    state = err.state;
    assert.equal(err.state.name, 'newPasswordRequired');
    assert.deepEqual(err.state.userAttributes, { sub: 'xxxx' });
  }

  // Call authenticate again with the state and the new password.
  let data = await service.authenticate({ password: 'newPassword', state });
  assert.deepEqual(data,  {
    access_token: 'xxxx',
    clientId: 'TEST',
    poolId: 'us-east-1_TEST',
    'Cognito.StorageItem': 'test'
  });
  assert.ok(get(service, 'cognito.user'), 'The cognito service user is populated.');
  assert.equal(get(service, 'cognito.user.username'), 'testuser', 'The username is set correctly.');
});

test('authenticateUser, newPasswordRequired failure', async function(assert) {
  let service = this.subject();

  this.stubUserMethods(service, (user) => {
    this.stub(user, 'authenticateUser').callsFake((authDetails, callbacks) => {
      callbacks.newPasswordRequired({ sub: 'xxxx', email_verified: false });
    });
    this.stub(user, 'completeNewPasswordChallenge').callsFake((password, userAttributs, callbacks) => {
      callbacks.onFailure({ message: 'Invalid password.' });
    });
  });

  let state;
  try {
    await service.authenticate({ username: 'testuser', password: 'password' });
    assert.ok(false, 'Should not resolve');
  } catch (err) {
    state = err.state;
    assert.equal(err.state.name, 'newPasswordRequired');
    assert.deepEqual(err.state.userAttributes, { sub: 'xxxx' });
  }

  try {
    // Call authenticate again with the state and the new password.
    await service.authenticate({ password: 'newPassword', state });
    assert.ok(false, 'Should not resolve');
  } catch (err) {
    assert.equal(err.message, 'Invalid password.');
  }
});

test('authenticateUser, refresh state', async function(assert) {
  let service = this.subject();
  let session = newSession();
  this.stub(session, 'isValid').returns(true);

  set(service, 'cognito.user', MockUser.create({
    session,
    storageData: {
      access_token: 'oldtoken',
      clientId: 'TEST',
      poolId: 'us-east-1_TEST',
      'Cognito.StorageItem': 'test'
    }
  }));

  let data = await service.authenticate({ state: { name: 'refresh' } });
  assert.deepEqual(data,  {
    access_token: 'xxxx',
    clientId: 'TEST',
    poolId: 'us-east-1_TEST',
    'Cognito.StorageItem': 'test'
  });
  assert.ok(get(service, 'cognito.user'), 'The cognito service user is populated.');
});

test('invalidate', async function(assert) {
  let data = {
    poolId: 'us-east-1_TEST',
    clientId: 'TEST',
    'CognitoIdentityServiceProvider.TEST.testuser.idToken': 'aaaaa',
    'CognitoIdentityServiceProvider.TEST.testuser.accessToken': 'bbbbb',
    'CognitoIdentityServiceProvider.TEST.testuser.refreshToken': 'ccccc',
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  };
  let service = this.subject();
  set(service, 'cognito.user', 'user');

  let resolvedData = await service.invalidate(data);
  assert.deepEqual(data, resolvedData);
  // Cognito user no longer exists on service
  assert.equal(get(service, 'cognito.user'), undefined);
});
