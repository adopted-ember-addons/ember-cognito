import { moduleFor, test } from 'ember-qunit';

moduleFor('authenticator:cognito', 'Unit | Authenticator | cognito', {
  needs: ['service:cognito']
});

test('config is set correctly', function(assert) {
  let service = this.subject();
  assert.equal(service.get('poolId'), 'us-east-1_TEST');
  assert.equal(service.get('clientId'), 'TEST');
});
