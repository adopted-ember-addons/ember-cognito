import { currentURL, find, visit } from '@ember/test-helpers';
import { mockCognitoUser } from '#src/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { module, test } from 'qunit';

//
// This is an example of how one could use the Cognito authenticator and service in an acceptance test.
//

module('Acceptance | nav bar', function (hooks) {
  setupApplicationTest(hooks);

  test('logout', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), '/');
    assert.ok(find('.login-link'));
    assert.notOk(find('.logout-link'));
  });

  test('login', async function (assert) {
    await authenticateSession();
    await mockCognitoUser({
      username: 'testuser',
    });
    await visit('/');

    assert.strictEqual(currentURL(), '/');
    assert.notOk(find('.login-link'));
    assert.ok(find('.logout-link'));
  });
});
