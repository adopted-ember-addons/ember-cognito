import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { currentSession } from 'ember-simple-auth/test-support';
import { mockCognitoUser } from 'ember-cognito/test-support';
import setupSinonTest from '../helpers/sinon';

//
// This is an example of testing authentication by stubbing the authenticator.
//

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);
  setupSinonTest(hooks);

  test('login', async function (assert) {
    await mockCognitoUser({ username: 'testuser' });
    const authenticator = this.owner.lookup('authenticator:cognito');
    this.sinon.stub(authenticator, 'authenticate').resolves();

    await visit('/login');
    await fillIn('#username', 'testuser');
    await fillIn('#password', 'password');
    await click('.login-form [type=submit]');

    let session = await currentSession();
    assert.true(session.isAuthenticated);
    assert.strictEqual(currentURL(), '/');
  });
});
