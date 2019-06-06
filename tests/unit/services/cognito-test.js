import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import { CognitoUser as AWSCognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import CognitoUser from 'dummy/utils/cognito-user';
import config from '../../../config/environment';

module('Unit | Service | cognito', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.stubPoolMethod = function(service, method, fn) {
      this.stub(service, '_stubPool').callsFake((pool) => {
        this.stub(pool, method).callsFake(fn);
        return pool;
      });
    };
  });

  function getAwsUser(username) {
    let pool = new CognitoUserPool({ UserPoolId: 'us-east-1_TEST', ClientId: 'TEST' });
    return new AWSCognitoUser({ Username: username, Pool: pool });
  }

  test('config is set correctly', function(assert) {
    let service = this.owner.lookup('service:cognito');
    assert.equal(get(service, 'poolId'), 'us-east-1_TEST');
    assert.equal(get(service, 'clientId'), 'TEST');
    assert.equal(get(service, 'authenticationFlowType'), config.cognito.authenticationFlowType);
  });

  sinonTest('signup works', async function(assert) {
    let service = this.owner.lookup('service:cognito');
    this.stubPoolMethod(service, 'signUp', (username, password, attributeList, validationData, callback) => {
      // Return data is:
      // user: new CognitoUser
      // userConfirmed: boolean
      // userSub: ID
      callback(null, {
        user: getAwsUser(username),
        userConfirmed: true,
        userSub: 'xxxx'
      });
    });

    let result = await service.signUp('testuser', 'password', [], null);
    // The user should be upgraded to one of our users
    assert.ok(result.user instanceof CognitoUser);
    assert.equal(result.userConfirmed, true);
    assert.equal(result.userSub, 'xxxx');
  });

  sinonTest('signup error', async function(assert) {
    assert.expect(1);

    let service = this.owner.lookup('service:cognito');
    this.stubPoolMethod(service, 'signUp', (username, password, attributeList, validationData, callback) => {
      // Return data is:
      // user: new CognitoUser
      // userConfirmed: boolean
      // userSub: ID
      callback('error', null);
    });

    try {
      await service.signUp('testuser', 'password', [], null);
      assert.ok(false); // shouldn't get here.
    } catch (err) {
      assert.equal(err, 'error');
    }
  });

  // TODO: Test attributes/validation data
  // TODO: Test deprecated attributes
});
