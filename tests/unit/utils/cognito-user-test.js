import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { resolve } from 'rsvp';
import { setupTest } from 'ember-qunit';
import CognitoUser from 'dummy/utils/cognito-user';
import { module, test } from 'qunit';
import {
  makeToken,
  MockAuth,
  newSession,
  newUser,
} from 'ember-cognito/test-support';
import setupSinonTest from '../../helpers/sinon';

module('Unit | Utility | cognito user', function (hooks) {
  setupTest(hooks);
  setupSinonTest(hooks);

  test('username', function (assert) {
    const user = CognitoUser.create({ user: newUser('testuser') });
    assert.strictEqual(user.username, 'testuser');
  });

  test('changePassword', async function (assert) {
    assert.expect(2);

    const auth = MockAuth.extend({
      changePassword(user, oldPassword, newPassword) {
        assert.strictEqual(oldPassword, 'oldpass');
        assert.strictEqual(newPassword, 'newpass');
      },
    }).create();

    const user = CognitoUser.create({ auth });
    await user.changePassword('oldpass', 'newpass');
  });

  test('deleteAttributes', async function (assert) {
    assert.expect(1);

    const awsUser = newUser('testuser');
    this.sinon
      .stub(awsUser, 'deleteAttributes')
      .callsFake((attributeList, callback) => {
        assert.deepEqual(attributeList, ['first_name', 'last_name']);
        callback(null, 'SUCCESS');
      });
    const user = CognitoUser.create({ user: awsUser });
    await user.deleteAttributes(['first_name', 'last_name']);
  });

  test('deleteUser', async function (assert) {
    const awsUser = newUser('testuser');
    this.sinon.stub(awsUser, 'deleteUser').callsFake((callback) => {
      callback(null, 'SUCCESS');
    });
    const user = CognitoUser.create({ user: awsUser });
    const text = await user.deleteUser();
    assert.strictEqual(text, 'SUCCESS');
  });

  test('getAttributeVerificationCode', async function (assert) {
    assert.expect(2);

    const auth = MockAuth.extend({
      verifyUserAttribute(user, attributeName) {
        assert.strictEqual(user.username, 'testuser');
        assert.strictEqual(attributeName, 'email');
      },
    }).create();

    const user = CognitoUser.create({ auth, user: newUser('testuser') });
    await user.getAttributeVerificationCode('email');
  });

  test('getSession', async function (assert) {
    const auth = MockAuth.create({ _authenticatedUser: newUser('testuser') });
    const user = CognitoUser.create({ auth });

    const session = await user.getSession();
    assert.strictEqual(
      session.getIdToken().getJwtToken().substring(0, 7),
      'header.',
    );
  });

  test('getSession error', async function (assert) {
    assert.expect(1);

    const auth = MockAuth.create();
    const user = CognitoUser.create({ auth });

    try {
      await user.getSession();
      assert.ok(false);
    } catch (err) {
      assert.strictEqual(err, 'user not authenticated');
    }
  });

  test('getUserAttributes', async function (assert) {
    assert.expect(2);

    const auth = MockAuth.extend({
      userAttributes(user) {
        assert.strictEqual(user.username, 'testuser');
        return resolve([
          new CognitoUserAttribute({
            Name: 'sub',
            Value: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffffgggg',
          }),
          new CognitoUserAttribute({ Name: 'email_verified', Value: true }),
        ]);
      },
    }).create();

    const user = CognitoUser.create({ auth, user: newUser('testuser') });
    const attrs = await user.getUserAttributes();
    assert.strictEqual(attrs.length, 2);
  });

  test('getUserAttributesHash', async function (assert) {
    const auth = MockAuth.extend({
      userAttributes() {
        return resolve([
          new CognitoUserAttribute({
            Name: 'sub',
            Value: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffffgggg',
          }),
          new CognitoUserAttribute({ Name: 'email_verified', Value: true }),
        ]);
      },
    }).create();

    const user = CognitoUser.create({ auth, user: newUser('testuser') });
    const attrs = await user.getUserAttributesHash();
    assert.deepEqual(attrs, {
      sub: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffffgggg',
      email_verified: true,
    });
  });

  test('updateAttributes', async function (assert) {
    assert.expect(4);

    const auth = MockAuth.extend({
      updateUserAttributes(user, attributes) {
        assert.strictEqual(user.username, 'testuser');
        assert.deepEqual(attributes, { a: 1, b: 2 });
      },
    }).create();

    const user = CognitoUser.create({ auth, user: newUser('testuser') });
    await user.updateAttributes({ a: 1, b: 2 });
    // Test deprecated objects
    await user.updateAttributes([
      new CognitoUserAttribute({ Name: 'a', Value: 1 }),
      new CognitoUserAttribute({ Name: 'b', Value: 2 }),
    ]);
  });

  test('verifyAttribute', async function (assert) {
    assert.expect(3);

    const auth = MockAuth.extend({
      verifyUserAttributeSubmit(user, attributeName, confirmationCode) {
        assert.strictEqual(user.username, 'testuser');
        assert.strictEqual(attributeName, 'email');
        assert.strictEqual(confirmationCode, '1234');
      },
    }).create();

    const user = CognitoUser.create({ auth, user: newUser('testuser') });
    await user.verifyAttribute('email', '1234');
  });

  test('getGroups', async function (assert) {
    const awsUser = newUser('testuser');
    const idToken = makeToken({
      extra: { 'cognito:groups': ['Group 1', 'Group 2'] },
    });
    const auth = MockAuth.extend({
      currentSession() {
        return resolve(newSession({ idToken }));
      },
    }).create();

    const user = CognitoUser.create({ auth, user: awsUser });
    const groups = await user.getGroups();
    assert.deepEqual(groups, ['Group 1', 'Group 2']);
  });

  test('getGroups no groups', async function (assert) {
    const awsUser = newUser('testuser');
    const idToken = makeToken();
    const auth = MockAuth.extend({
      currentSession() {
        return resolve(newSession({ idToken }));
      },
    }).create();

    const user = CognitoUser.create({ auth, user: awsUser });
    const groups = await user.getGroups();
    assert.deepEqual(groups, []);
  });

  test('signOut', async function (assert) {
    assert.expect(1);

    const auth = MockAuth.extend({
      signOut() {
        assert.ok(true);
      },
    }).create();

    const user = CognitoUser.create({ auth });
    await user.signOut();
  });
});
