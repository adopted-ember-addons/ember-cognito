import { get } from '@ember/object';
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoUser as AWSCognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession
} from 'amazon-cognito-identity-js';
import CognitoStorage from 'dummy/utils/cognito-storage';
import CognitoUser from 'dummy/utils/cognito-user';
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';

module('Unit | Utility | cognito user');

function getAwsUser() {
  let pool = new CognitoUserPool({ UserPoolId: 'us-east-1_TEST', ClientId: 'TEST' });
  return new AWSCognitoUser({ Username: 'testuser', Pool: pool });
}

test('username', function(assert) {
  let user = CognitoUser.create({ user: getAwsUser() });
  assert.equal(get(user, 'username'), 'testuser');
});

test('getSession', function(assert) {
  let awsUser = getAwsUser();
  this.stub(awsUser, 'getSession').callsFake((callback) => {
    // This should return an instance of a CognitoUserSession.
    callback(null, new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: 'xxxx' }),
      AccessToken: new CognitoAccessToken({ AccessToken: 'yyyy' })
    }));
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getSession().then((session) => {
    assert.equal(session.getIdToken().getJwtToken(), 'xxxx');
  });
});

test('getSession error', function(assert) {
  let awsUser = getAwsUser();
  this.stub(awsUser, 'getSession').callsFake((callback) => {
    callback('error', null);
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getSession().then(() => {
    assert.ok(false);
  }).catch((err) => {
    assert.equal(err, 'error');
  });
});

test('getUserAttributes', function(assert) {
  let awsUser = getAwsUser();
  this.stub(awsUser, 'getUserAttributes').callsFake((callback) => {
    // This should return an instance of a CognitoUserSession.
    callback(null, [
      new CognitoUserAttribute({ Name: 'sub', Value: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffffgggg' }),
      new CognitoUserAttribute({ Name: 'email_verified', Value: true })
    ]);
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getUserAttributes().then((attrs) => {
    assert.equal(attrs.length, 2);
  });
});

test('getUserAttributes error', function(assert) {
  let awsUser = getAwsUser();
  this.stub(awsUser, 'getUserAttributes').callsFake((callback) => {
    callback('error', null);
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getUserAttributes().then(() => {
    assert.ok(false);
  }).catch((err) => {
    assert.equal(err, 'error');
  });
});

test('signOut and getStorageData()', function(assert) {
  let awsUser = getAwsUser();
  awsUser.storage = new CognitoStorage({
    'CognitoIdentityServiceProvider.TEST.testuser.idToken': 'aaaaa',
    'CognitoIdentityServiceProvider.TEST.testuser.accessToken': 'bbbbb',
    'CognitoIdentityServiceProvider.TEST.testuser.refreshToken': 'ccccc',
    'CognitoIdentityServiceProvider.TEST.LastAuthUser': 'testuser'
  });
  let user = CognitoUser.create({ user: awsUser });
  assert.notDeepEqual(user.getStorageData(), {});

  user.signOut();
  assert.deepEqual(user.getStorageData(), {});
});
