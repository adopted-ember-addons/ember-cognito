import CognitoStorage from 'dummy/utils/cognito-storage';
import { module, test } from 'qunit';

module('Unit | Utility | cognito storage');

test('it works', function(assert) {
  let storage = new CognitoStorage();

  let key = 'Cognito.ClientId.idToken';
  assert.equal(storage.getItem(key), undefined);

  storage.setItem(key, 'xyxyxyx');
  assert.equal(storage.getItem(key), 'xyxyxyx');
  assert.deepEqual(storage.getData(), {
    'Cognito.ClientId.idToken': 'xyxyxyx'
  });

  let result = storage.removeItem(key);
  assert.equal(result, 'xyxyxyx');
  assert.equal(storage.getItem(key), undefined);
});
