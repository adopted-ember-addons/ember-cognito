import { get } from '@ember/object';
import { resolve } from 'rsvp';
import { currentSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser, getAuthenticator } from '../../tests/helpers/ember-cognito';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import { visit, fillIn, click, currentURL } from 'ember-native-dom-helpers';

//
// This is an example of testing authentication by stubbing the authenticator
// using the pre ember-qunit 4.2 helpers.
//

moduleForAcceptance('Acceptance | ember-qunit < 4.2 helpers');

sinonTest('ember-qunit < 4.2 helpers', async function(assert) {
  let authenticator = getAuthenticator(this.application);
  this.stub(authenticator, 'authenticate').callsFake(({ username }) => {
    mockCognitoUser(this.application, { username });
    return resolve();
  });

  await visit('/login');
  await fillIn('#username', 'testuser');
  await fillIn('#password', 'password');
  await click('.login-form [type=submit]');

  let session = currentSession(this.application);
  assert.equal(get(session, 'isAuthenticated'), true);
  assert.equal(currentURL(), '/');
});
