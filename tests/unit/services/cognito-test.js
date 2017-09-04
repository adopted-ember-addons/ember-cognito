import { get } from '@ember/object';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:cognito', 'Unit | Service | cognito', {
});

test('config is set correctly', function(assert) {
  let service = this.subject();
  assert.equal(get(service, 'poolId'), 'us-east-1_TEST');
  assert.equal(get(service, 'clientId'), 'TEST');
});
