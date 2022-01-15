import CognitoStorage from 'dummy/utils/cognito-storage';
import { module, test } from 'qunit';

module('Unit | Utility | cognito storage', function () {
  test('it works', function (assert) {
    let storage = new CognitoStorage();

    let key = 'Cognito.ClientId.idToken';
    assert.strictEqual(storage.getItem(key), undefined);

    storage.setItem(key, 'xyxyxyx');
    assert.strictEqual(storage.getItem(key), 'xyxyxyx');
    assert.deepEqual(storage.getData(), {
      'Cognito.ClientId.idToken': 'xyxyxyx',
    });

    let result = storage.removeItem(key);
    assert.strictEqual(result, 'xyxyxyx');
    assert.strictEqual(storage.getItem(key), undefined);
  });
});
