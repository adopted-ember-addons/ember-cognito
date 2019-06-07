import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, find, findAll, visit } from '@ember/test-helpers';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { mockCognitoUser } from 'ember-cognito/test-support';

module('Acceptance | index', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting / unauthenticated', async function(assert) {
    await visit('/');
    assert.equal(currentURL(), '/');
    assert.ok(find('.index-unauth'));
  });

  //
  // This is an example of how to mock user attributes in an acceptance test.
  //
  test('visiting /', async function(assert) {
    await authenticateSession();
    await mockCognitoUser({
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
      'sub', 'aaaabbbb-cccc-dddd-eeee-ffffgggghhhh', 'Edit',
      'email', 'testuser@gmail.com', 'Edit',
      'email_verified', 'false', 'Edit'
    ]);
  });
});
