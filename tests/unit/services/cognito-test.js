import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { set } from '@ember/object';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import CognitoUser from 'dummy/utils/cognito-user';
import config from '../../../config/environment';
import {
  mockAuth,
  MockAuth,
  mockCognitoUser,
  newUser,
} from 'ember-cognito/test-support';
import { reject, resolve } from 'rsvp';

module('Unit | Service | cognito', function (hooks) {
  setupTest(hooks);

  test('config is set correctly', function (assert) {
    const service = this.owner.lookup('service:cognito');
    assert.strictEqual(service.poolId, 'us-east-1_TEST');
    assert.strictEqual(service.clientId, 'TEST');
    assert.strictEqual(
      service.authenticationFlowType,
      config.cognito.authenticationFlowType,
    );
  });

  test('signup works', async function (assert) {
    const service = this.owner.lookup('service:cognito');

    await mockAuth(
      MockAuth.extend({
        signUp(username) {
          return resolve({
            user: newUser(username),
            userConfirmed: true,
            userSub: 'xxxx',
          });
        },
      }),
    );

    let result = await service.signUp('testuser', 'password', [], null);
    // The user should be upgraded to one of our users
    assert.ok(result.user instanceof CognitoUser);
    assert.true(result.userConfirmed);
    assert.strictEqual(result.userSub, 'xxxx');
  });

  test('signup error', async function (assert) {
    assert.expect(1);

    const service = this.owner.lookup('service:cognito');

    await mockAuth(
      MockAuth.extend({
        signUp() {
          return reject('error');
        },
      }),
    );

    try {
      await service.signUp('testuser', 'password', [], null);
      assert.ok(false); // shouldn't get here.
    } catch (err) {
      assert.strictEqual(err, 'error');
    }
  });

  test('deprecated attribute array', async function (assert) {
    const service = this.owner.lookup('service:cognito');

    const auth = MockAuth.extend({
      signUp({ username, attributes, validationData }) {
        set(this, 'attributes', attributes);
        set(this, 'validationData', validationData);
        return resolve({
          user: newUser(username),
          userConfirmed: true,
          userSub: 'xxxx',
        });
      },
    }).create();
    await mockAuth(auth);
    const attrs = [
      new CognitoUserAttribute({ Name: 'email', Value: 'test@email.com' }),
      new CognitoUserAttribute({ Name: 'phone_number', Value: '555-1212' }),
    ];
    const validation = [{ foo: 'bar' }];

    await service.signUp('testuser', 'password', attrs, validation);
    assert.deepEqual(auth.attributes, {
      email: 'test@email.com',
      phone_number: '555-1212',
    });
    assert.deepEqual(auth.validationData, [{ foo: 'bar' }]);
  });

  test('getIdToken auth', async function (assert) {
    await mockCognitoUser({ username: 'testuser' });

    const service = this.owner.lookup('service:cognito');
    const token = await service.getIdToken();
    assert.ok(token.startsWith('header.'));
  });

  test('getIdToken unauth', async function (assert) {
    const service = this.owner.lookup('service:cognito');
    assert.rejects(service.getIdToken());
  });
});
