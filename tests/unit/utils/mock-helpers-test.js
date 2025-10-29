import {
  mockAuth,
  MockAuth,
  mockCognitoUser,
  newUser,
  unmockCognitoUser,
} from '#src/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Utility | mock helpers', function (hooks) {
  setupTest(hooks);

  test('mockCognitoUser', async function (assert) {
    await mockCognitoUser({
      username: 'testuser',
      userAttributes: [
        { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
        { name: 'email', value: 'testuser@gmail.com' },
      ],
    });
    let cognito = this.owner.lookup('service:cognito');
    assert.deepEqual(cognito.user.userAttributes, [
      { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
      { name: 'email', value: 'testuser@gmail.com' },
    ]);

    await unmockCognitoUser();
    assert.notOk(cognito.user);
    assert.strictEqual(cognito.auth._authenticatedUser.username, 'testuser');
  });

  test('newUser', async function (assert) {
    const awsUser = newUser('testuser');
    assert.strictEqual(awsUser.username, 'testuser');
  });

  test('mockAuth can accept an auth class', async function (assert) {
    await mockAuth(MockAuth.extend({ foo: 'bar' }));
    const cognito = this.owner.lookup('service:cognito');
    assert.strictEqual(cognito.auth.foo, 'bar');
  });

  test('mockAuth can accept an auth instance', async function (assert) {
    await mockAuth(MockAuth.create({ bar: 'baz' }));
    const cognito = this.owner.lookup('service:cognito');
    assert.strictEqual(cognito.auth.bar, 'baz');
  });
});
