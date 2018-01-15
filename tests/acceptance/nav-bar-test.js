import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { authenticateSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser } from '../../tests/helpers/ember-cognito';
import { visit, currentURL, find } from 'ember-native-dom-helpers';

//
// This is an example of how one could use the Cognito authenticator and service in an acceptance test.
//

moduleForAcceptance('Acceptance | nav bar');

test('logout', async function(assert) {
  await visit('/');

  assert.equal(currentURL(), '/');
  assert.ok(find('.login-link'));
  assert.notOk(find('.profile-link'));
});

test('login', async function(assert) {
  authenticateSession(this.application);
  mockCognitoUser(this.application, {
    username: 'testuser'
  });
  await visit('/');

  assert.equal(currentURL(), '/');
  assert.notOk(find('.login-link'));
  assert.ok(find('.profile-link'));
  assert.equal(find('.profile-link').textContent.trim(), 'testuser');
});
