import { module, test } from 'qunit';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { MockUser } from 'ember-cognito/test-support/utils/ember-cognito';

module('Unit | Utility | mock user', function () {
  test('groups', async function (assert) {
    let user = MockUser.create({
      groups: ['A', 'B'],
    });
    let groups = await user.getGroups();
    assert.deepEqual(groups, ['A', 'B']);
  });

  test('updateAttributes adds new', async function (assert) {
    let user = MockUser.create({});
    let newAttr = new CognitoUserAttribute({
      Name: 'family_name',
      Value: 'Coltrane',
    });

    await user.updateAttributes([newAttr]);
    assert.deepEqual(user.userAttributes, [
      { name: 'family_name', value: 'Coltrane' },
    ]);
  });

  test('updateAttributes updates existing', async function (assert) {
    let user = MockUser.create({
      userAttributes: [
        { name: 'given_name', value: 'John' },
        { name: 'family_name', value: 'Coltrane' },
      ],
    });

    let newAttr = new CognitoUserAttribute({
      Name: 'family_name',
      Value: 'New Trane',
    });

    await user.updateAttributes([newAttr]);
    assert.deepEqual(user.userAttributes, [
      { name: 'given_name', value: 'John' },
      { name: 'family_name', value: 'New Trane' },
    ]);
  });

  test('updateAttributes supports hash arguments', async function (assert) {
    let user = MockUser.create({
      userAttributes: [
        { name: 'given_name', value: 'John' },
        { name: 'family_name', value: 'Coltrane' },
      ],
    });
    await user.updateAttributes({ family_name: 'New Trane' });
    assert.deepEqual(user.userAttributes, [
      { name: 'given_name', value: 'John' },
      { name: 'family_name', value: 'New Trane' },
    ]);
  });

  test('getUserAttributesHash', async function (assert) {
    let user = MockUser.create({
      userAttributes: [
        { name: 'given_name', value: 'John' },
        { name: 'family_name', value: 'Coltrane' },
      ],
    });
    assert.deepEqual(await user.getUserAttributesHash(), {
      given_name: 'John',
      family_name: 'Coltrane',
    });
  });

  test('simple methods', async function (assert) {
    let user = MockUser.create();
    assert.deepEqual(await user.changePassword('old', 'new'), {});
    assert.deepEqual(await user.confirmRegistration('123456'), {});
    assert.deepEqual(
      await user.deleteAttributes(['firstName', 'custom:a']),
      {},
    );
    assert.deepEqual(await user.forgotPassword(), {});
    assert.deepEqual(await user.getAttributeVerificationCode('email'), {});
    assert.deepEqual(await user.resendConfirmationCode(), {});
    assert.deepEqual(await user.signOut(), {});
    assert.deepEqual(await user.verifyAttribute('email', '123456'), {});
  });
});
