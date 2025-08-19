import { set } from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import config from '../../../config/environment';
import {
  mockAuth,
  MockAuth,
  mockCognitoUser,
  newUser,
} from 'ember-cognito/test-support';
import { reject } from 'rsvp';

module('Unit | Authenticator | cognito', function (hooks) {
  setupTest(hooks);

  test('config is set correctly', function (assert) {
    let service = this.owner.lookup('authenticator:cognito');
    assert.strictEqual(service.poolId, 'us-east-1_TEST');
    assert.strictEqual(service.clientId, 'TEST');
    assert.strictEqual(
      service.authenticationFlowType,
      config.cognito.authenticationFlowType,
    );
  });

  test('restore', async function (assert) {
    await mockCognitoUser({ username: 'testuser' });

    let service = this.owner.lookup('authenticator:cognito');
    set(service, 'cognito.autoRefreshSession', false);

    const data = { poolId: 'us-east-1_TEST', clientId: 'TEST' };
    let resolvedData = await service.restore(data);
    assert.strictEqual(resolvedData.poolId, 'us-east-1_TEST');
    assert.strictEqual(resolvedData.clientId, 'TEST');
    assert.ok(resolvedData.access_token.startsWith('header.'));
    assert.ok(service.cognito.user, 'The cognito service user is populated.');
    assert.strictEqual(
      service.cognito.user.username,
      'testuser',
      'The username is set correctly.',
    );
    assert.notOk(service.task, 'No task was scheduled.');
  });

  test('restore no current user', async function (assert) {
    assert.expect(1);

    await mockAuth();

    let service = this.owner.lookup('authenticator:cognito');
    try {
      await service.restore({ poolId: 'us-east-1_TEST', clientId: 'TEST' });
      assert.ok(false, 'Should not resolve.');
    } catch (err) {
      assert.deepEqual(err, 'user not authenticated', 'Restore rejects');
    }
  });

  test('restore, schedule expire task', async function (assert) {
    let service = this.owner.lookup('authenticator:cognito');
    set(service, 'cognito.autoRefreshSession', true);

    await mockCognitoUser({ username: 'testuser' });

    const data = { poolId: 'us-east-1_TEST', clientId: 'TEST' };
    await service.restore(data);
    assert.notStrictEqual(
      service.cognito.task,
      undefined,
      'Refresh timer was scheduled.',
    );
    let taskDuration = service.cognito._taskDuration;
    assert.ok(taskDuration > 1000 * 1000);
  });

  test('authenticateUser', async function (assert) {
    const service = this.owner.lookup('authenticator:cognito');
    set(service, 'cognito.autoRefreshSession', false);

    const user = newUser('testuser');
    await mockAuth(MockAuth.create({ _authenticatedUser: user }));

    const data = await service.authenticate({
      username: 'testuser',
      password: 'password',
    });
    assert.strictEqual(data.poolId, 'us-east-1_TEST');
    assert.strictEqual(data.clientId, 'TEST');
    assert.ok(service.cognito.user, 'The cognito service user is populated.');
    assert.strictEqual(
      service.cognito.user.username,
      'testuser',
      'The username is set correctly.',
    );
    assert.notOk(service.cognito.task, 'Refresh session task not set.');
  });

  test('authenticateUser, failure', async function (assert) {
    assert.expect(1);

    const service = this.owner.lookup('authenticator:cognito');
    await mockAuth(
      MockAuth.extend({
        signIn() {
          return reject({ message: 'Username or password incorrect.' });
        },
      }),
    );

    try {
      await service.authenticate({
        username: 'testuser',
        password: 'password',
      });
      assert.ok(false, 'Should not resolve');
    } catch (err) {
      assert.strictEqual(err.message, 'Username or password incorrect.');
    }
  });

  test('authenticateUser, newPasswordRequired', async function (assert) {
    assert.expect(5);

    const service = this.owner.lookup('authenticator:cognito');
    let user = newUser('testuser');
    user.challengeName = 'NEW_PASSWORD_REQUIRED';
    await mockAuth(MockAuth.create({ _authenticatedUser: user }));

    let state;
    try {
      await service.authenticate({
        username: 'testuser',
        password: 'password',
      });
      assert.ok(false, 'Should not resolve');
    } catch (err) {
      state = err.state;
      assert.strictEqual(err.state.name, 'newPasswordRequired');
    }
    user.challengeName = undefined;

    // Call authenticate again with the state and the new password.
    let data = await service.authenticate({ password: 'newPassword', state });
    assert.strictEqual(data.poolId, 'us-east-1_TEST');
    assert.strictEqual(data.clientId, 'TEST');
    assert.ok(service.cognito.user, 'The cognito service user is populated.');
    assert.strictEqual(
      service.cognito.user.username,
      'testuser',
      'The username is set correctly.',
    );
  });

  test('authenticateUser, newPasswordRequired failure', async function (assert) {
    assert.expect(2);

    const service = this.owner.lookup('authenticator:cognito');
    let user = newUser('testuser');
    user.challengeName = 'NEW_PASSWORD_REQUIRED';
    await mockAuth(MockAuth.create({ _authenticatedUser: user }));

    let state;
    try {
      await service.authenticate({
        username: 'testuser',
        password: 'password',
      });
      assert.ok(false, 'Should not resolve');
    } catch (err) {
      state = err.state;
      assert.strictEqual(err.state.name, 'newPasswordRequired');
    }

    await mockAuth(
      MockAuth.extend({
        completeNewPassword() {
          return reject({ message: 'Invalid password.' });
        },
      }),
    );

    try {
      // Call authenticate again with the state and the new password.
      await service.authenticate({ password: 'newPassword', state });
      assert.ok(false, 'Should not resolve');
    } catch (err) {
      assert.strictEqual(err.message, 'Invalid password.');
    }
  });

  test('authenticateUser, scheduled auto refresh', async function (assert) {
    const service = this.owner.lookup('authenticator:cognito');
    set(service, 'cognito.autoRefreshSession', true);

    const user = newUser('testuser');
    await mockAuth(MockAuth.create({ _authenticatedUser: user }));

    await service.authenticate({ username: 'testuser', password: 'password' });
    const task = service.cognito.task;
    assert.notEqual(task, undefined, 'Refresh session task is set.');
    let taskDuration = service.cognito._taskDuration;
    assert.ok(taskDuration > 1000 * 1000);
  });

  test('authenticateUser, refresh state', async function (assert) {
    let service = this.owner.lookup('authenticator:cognito');
    set(service, 'cognito.autoRefreshSession', true);

    await mockCognitoUser({ username: 'testuser' });

    let data = await service.authenticate({ state: { name: 'refresh' } });
    assert.strictEqual(data.poolId, 'us-east-1_TEST');
    assert.strictEqual(data.clientId, 'TEST');
    assert.ok(data.access_token.startsWith('header.'));
    assert.ok(service.cognito.user, 'The cognito service user is populated.');
    const task = service.cognito.task;
    assert.notEqual(task, undefined, 'Refresh session task is set.');
    let taskDuration = service.cognito._taskDuration;
    assert.ok(taskDuration > 1000 * 1000);
  });

  test('invalidate', async function (assert) {
    const data = {
      poolId: 'us-east-1_TEST',
      clientId: 'TEST',
    };
    const service = this.owner.lookup('authenticator:cognito');
    await mockCognitoUser({ username: 'testuser' });

    let resolvedData = await service.invalidate(data);
    assert.deepEqual(data, resolvedData);
    // Cognito user no longer exists on service
    assert.strictEqual(service.cognito.user, undefined);
  });
});
