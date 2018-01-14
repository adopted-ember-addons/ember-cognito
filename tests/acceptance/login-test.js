import { get } from '@ember/object';
import { resolve } from 'rsvp';
import { currentSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser, getAuthenticator } from '../../tests/helpers/ember-cognito';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import test from 'ember-sinon-qunit/test-support/test';
import { visit, fillIn, click, currentURL } from 'ember-native-dom-helpers';

//
// This is an example of testing authentication by stubbing the authenticator.
// Because you may want to test more functionality within an acceptance test
// (for instance, loading the current user and navigation on success),
// you can't stub session.authenticate directly.
//

moduleForAcceptance('Acceptance | login');

test('login', async function(assert) {
  let authenticator = getAuthenticator(this.application);
  this.stub(authenticator, 'authenticate').callsFake(({ username }) => {
    mockCognitoUser(this.application, { username });
    return resolve();
  });

  await visit('/login');
  await fillIn('#username', 'testuser');
  await fillIn('#password', 'password');
  await click('[type=submit]');

  let session = currentSession(this.application);
  assert.equal(get(session, 'isAuthenticated'), true);
  assert.equal(currentURL(), '/');
});
