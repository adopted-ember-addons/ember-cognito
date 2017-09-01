import { get } from '@ember/object';
import RSVP from 'rsvp';
import { currentSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser, getAuthenticator } from '../../tests/helpers/ember-cognito';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import test from 'ember-sinon-qunit/test-support/test';

//
// This is an example of testing authentication by stubbing the authenticator.
// Because you may want to test more functionality within an acceptance test
// (for instance, loading the current user and navigation on success),
// you can't stub session.authenticate directly.
//

moduleForAcceptance('Acceptance | login');

test('login', function(assert) {
  let authenticator = getAuthenticator(this.application);
  this.stub(authenticator, 'authenticate').callsFake(({ username }) => {
    mockCognitoUser(this.application, { username });
    return RSVP.resolve();
  });

  visit('/login');
  fillIn('#username', 'testuser');
  fillIn('#password', 'password');
  click('[type=submit]');

  andThen(() => {
    let session = currentSession(this.application);
    assert.equal(get(session, 'isAuthenticated'), true);
    assert.equal(currentURL(), '/');
  });
});
