import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { authenticateSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser } from '../../tests/helpers/ember-cognito';

//
// This is an example of how one could use the Cognito authenticator and service in an acceptance test.
//

moduleForAcceptance('Acceptance | nav bar');

test('logout', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(find('.login-link').length, 1);
    assert.equal(find('.profile-link').length, 0);
  });
});

test('login', function(assert) {
  authenticateSession(this.application);
  mockCognitoUser(this.application, {
    username: 'testuser'
  });
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(find('.login-link').length, 0);
    assert.equal(find('.profile-link').length, 1);
    assert.equal(find('.profile-link').text().trim(), 'testuser');
  });
});
