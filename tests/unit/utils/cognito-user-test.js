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

function makeJwt(payload) {
  // For now, don't care about the first or third parts of the token.
  let encoded = btoa(JSON.stringify(payload));
  return `xxxx.${encoded}.yyyy`;
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

test('changePassword', function(assert) {
  assert.expect(3);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'changePassword').callsFake((oldPass, newPass, callback) => {
    assert.equal(oldPass, 'oldpass');
    assert.equal(newPass, 'newpass');
    callback(null, 'SUCCESS');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.changePassword('oldpass', 'newpass').then(() => {
    assert.ok(true);
  });
});

test('confirmPassword', function(assert) {
  assert.expect(3);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'confirmPassword').callsFake((code, password, callback) => {
    assert.equal(code, '1234');
    assert.equal(password, 'newpass');
    callback.onSuccess();
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.confirmPassword('1234', 'newpass').then(() => {
    assert.ok(true);
  });
});

test('confirmRegistration', function(assert) {
  assert.expect(3);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'confirmRegistration').callsFake((code, force, callback) => {
    assert.equal(code, '1234');
    assert.strictEqual(force, true);
    callback(null, 'SUCCESS');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.confirmRegistration('1234', true).then((text) => {
    assert.equal(text, 'SUCCESS');
  });
});

test('deleteAttributes', function(assert) {
  assert.expect(2);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'deleteAttributes').callsFake((attributeList, callback) => {
    assert.deepEqual(attributeList, ['first_name', 'last_name']);
    callback(null, 'SUCCESS');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.deleteAttributes(['first_name', 'last_name']).then(() => {
    assert.ok(true);
  });
});

test('forgotPassword', function(assert) {
  assert.expect(3);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'forgotPassword').callsFake((callback) => {
    assert.ok(callback.onFailure);
    assert.ok(callback.onSuccess);
    callback.onSuccess();
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.forgotPassword().then(() => {
    assert.ok(true);
  });
});

test('getAttributeVerificationCode', function(assert) {
  assert.expect(4);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'getAttributeVerificationCode').callsFake((attrName, callback) => {
    assert.equal(attrName, 'email');
    assert.ok(callback.onFailure);
    assert.ok(callback.onSuccess);
    callback.onSuccess();
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getAttributeVerificationCode('email').then(() => {
    assert.ok(true);
  });
});

test('getAttributeVerificationCode error', function(assert) {
  assert.expect(4);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'getAttributeVerificationCode').callsFake((attrName, callback) => {
    assert.equal(attrName, 'email');
    assert.ok(callback.onFailure);
    assert.ok(callback.onSuccess);
    callback.onFailure('some error');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getAttributeVerificationCode('email').catch((err) => {
    assert.equal(err, 'some error');
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

test('resendConformationCode', function(assert) {
  let awsUser = getAwsUser();
  this.stub(awsUser, 'resendConfirmationCode').callsFake((callback) => {
    callback(null, 'SUCCESS');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.resendConfirmationCode().then((text) => {
    assert.equal(text, 'SUCCESS');
  });
});

test('updateAttributes', function(assert) {
  assert.expect(2);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'updateAttributes').callsFake((attributeList, callback) => {
    assert.deepEqual(attributeList, []);
    callback(null, 'SUCCESS');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.updateAttributes([]).then(() => {
    assert.ok(true);
  });
});

test('verifyAttribute', function(assert) {
  assert.expect(3);

  let awsUser = getAwsUser();
  this.stub(awsUser, 'verifyAttribute').callsFake((attrName, code, callback) => {
    assert.equal(attrName, 'email');
    assert.equal(code, '1234');
    callback(null, 'SUCCESS');
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.verifyAttribute('email', '1234').then(() => {
    assert.ok(true);
  });
});

test('getGroups', function(assert) {
  let awsUser = getAwsUser();
  let token = makeJwt({ "cognito:groups": ["Group 1","Group 2"] });
  this.stub(awsUser, 'getSession').callsFake((callback) => {
    // This should return an instance of a CognitoUserSession.
    callback(null, new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: token }),
      AccessToken: new CognitoAccessToken({ AccessToken: token })
    }));
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getGroups().then((groups) => {
    assert.deepEqual(groups, ['Group 1', 'Group 2']);
  });
});

test('getGroups no groups', function(assert) {
  let awsUser = getAwsUser();
  let token = makeJwt({});
  this.stub(awsUser, 'getSession').callsFake((callback) => {
    // This should return an instance of a CognitoUserSession.
    callback(null, new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: token }),
      AccessToken: new CognitoAccessToken({ AccessToken: token })
    }));
  });
  let user = CognitoUser.create({ user: awsUser });
  return user.getGroups().then((groups) => {
    assert.deepEqual(groups, []);
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
