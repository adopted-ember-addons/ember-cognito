import { setupApplicationTest } from 'ember-qunit';
import { module } from 'qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import { get } from '@ember/object';
import { visit, fillIn, click, currentURL } from '@ember/test-helpers';
import { currentSession } from 'ember-simple-auth/test-support';
import { mockCognitoUser } from 'ember-cognito/test-support';
import { resolve } from 'rsvp';

//
// This is an example of testing authentication by stubbing the authenticator.
//

module('Acceptance | login', function(hooks) {
  setupApplicationTest(hooks);

  sinonTest('login', async function(assert) {
    await mockCognitoUser();
    let authenticator = this.owner.lookup('authenticator:cognito');
    this.stub(authenticator, 'authenticate').callsFake(() => resolve());  // works with 2.12
    // this.stub(authenticator, 'authenticate').resolves();  // OK for 2.16+

    await visit('/login');
    await fillIn('#username', 'testuser');
    await fillIn('#password', 'password');
    await click('.login-form [type=submit]');

    let session = await currentSession();
    assert.equal(get(session, 'isAuthenticated'), true);
    assert.equal(currentURL(), '/');
  });
});
