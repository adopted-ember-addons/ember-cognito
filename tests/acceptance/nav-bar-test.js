import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL, find } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { mockCognitoUser } from '#src/test-support';

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
