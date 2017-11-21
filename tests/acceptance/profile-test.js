import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { authenticateSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser } from '../../tests/helpers/ember-cognito';
import { findAll } from 'ember-native-dom-helpers';

moduleForAcceptance('Acceptance | profile');

test('visiting /profile unauthenticated', function(assert) {
  visit('/profile');

  andThen(function() {
    assert.equal(currentURL(), '/login');
  });
});

//
// This is an example of how to mock user attributes in an acceptance test.
//
test('visiting /profile', function(assert) {
  authenticateSession(this.application);
  mockCognitoUser(this.application, {
    username: 'testuser',
    userAttributes: [
      { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
      { name: 'email', value: 'testuser@gmail.com' },
      { name: 'email_verified', value: 'false' }
    ]
  });

  visit('/profile');

  andThen(function() {
    assert.equal(currentURL(), '/profile');
    // Map each element to get the text from it
    let text = findAll('tbody td').map(function(elem) {
      return elem.textContent.trim();
    });

    assert.deepEqual(text, [
      'sub', 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh',
      'username', 'testuser',
      'email', 'testuser@gmail.com',
      'email_verified', 'false'
    ]);
  });
});
