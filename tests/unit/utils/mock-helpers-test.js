import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { get } from '@ember/object';
import { mockCognitoUser, unmockCognitoUser } from 'ember-cognito/test-support';

module('Unit | Utility | flash errors', function(hooks) {
  setupTest(hooks);

  test('it works', async function(assert) {
    await mockCognitoUser({
      username: 'testuser',
      userAttributes: [
        { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
        { name: 'email', value: 'testuser@gmail.com' }
      ]
    });
    let cognito = this.owner.lookup('service:cognito');
    assert.deepEqual(get(cognito, 'user.userAttributes'), [
      { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
      { name: 'email', value: 'testuser@gmail.com' }
    ]);

    await unmockCognitoUser();
    assert.notOk(get(cognito, 'user'));
  });
});
