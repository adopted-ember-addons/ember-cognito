import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { authenticateSession } from '../../tests/helpers/ember-simple-auth';
import { mockCognitoUser } from '../../tests/helpers/ember-cognito';
import { visit, currentURL, find, findAll } from 'ember-native-dom-helpers';

moduleForAcceptance('Acceptance | index');

test('visiting / unauthenticated', async function(assert) {
  await visit('/');
  assert.equal(currentURL(), '/');
  assert.ok(find('.index-unauth'));
});

//
// This is an example of how to mock user attributes in an acceptance test.
//
test('visiting /', async function(assert) {
  authenticateSession(this.application);
  mockCognitoUser(this.application, {
    username: 'testuser',
    userAttributes: [
      { name: 'sub', value: 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh' },
      { name: 'email', value: 'testuser@gmail.com' },
      { name: 'email_verified', value: 'false' }
    ]
  });

  await visit('/');

  assert.equal(currentURL(), '/');
  // Map each element to get the text from it
  let text = findAll('tbody td').map(function(elem) {
    return elem.textContent.trim();
  });

  assert.deepEqual(text, [
    'sub', 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh',
    'email', 'testuser@gmail.com',
    'email_verified', 'false'
  ]);
});
