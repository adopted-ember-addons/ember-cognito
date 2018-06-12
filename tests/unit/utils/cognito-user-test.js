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
import sinonTest from 'ember-sinon-qunit/test-support/test';

module('Unit | Utility | cognito user', function() {
  function getAwsUser() {
    let pool = new CognitoUserPool({ UserPoolId: 'us-east-1_TEST', ClientId: 'TEST' });
    return new AWSCognitoUser({ Username: 'testuser', Pool: pool });
  }

  function makeJwt(payload) {
    // For now, don't care about the first or third parts of the token.
    let encoded = btoa(JSON.stringify(payload));
    return `xxxx.${encoded}.yyyy`;
  }

  sinonTest('username', function(assert) {
    let user = CognitoUser.create({ user: getAwsUser() });
    assert.equal(get(user, 'username'), 'testuser');
  });

  sinonTest('getSession', async function(assert) {
    let awsUser = getAwsUser();
    this.stub(awsUser, 'getSession').callsFake((callback) => {
      // This should return an instance of a CognitoUserSession.
      callback(null, new CognitoUserSession({
        IdToken: new CognitoIdToken({ IdToken: 'xxxx' }),
        AccessToken: new CognitoAccessToken({ AccessToken: 'yyyy' })
      }));
    });
    let user = CognitoUser.create({ user: awsUser });
    let session = await user.getSession();
    assert.equal(session.getIdToken().getJwtToken(), 'xxxx');
  });

  sinonTest('getSession error', async function(assert) {
    let awsUser = getAwsUser();
    this.stub(awsUser, 'getSession').callsFake((callback) => {
      callback('error', null);
    });
    let user = CognitoUser.create({ user: awsUser });
    try {
      await user.getSession();
      assert.ok(false);
    } catch (err) {
      assert.equal(err, 'error');
    }
  });
  sinonTest('getSession exception', async function(assert) {
    let awsUser = getAwsUser();
    this.stub(awsUser, 'getSession').callsFake(() => {
      throw('error');
    });
    let user = CognitoUser.create({ user: awsUser });
    try {
      await user.getSession();
      assert.ok(false);
    } catch (err) {
      assert.equal(err, 'error');
    }
  });

  sinonTest('changePassword', async function(assert) {
    assert.expect(2);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'changePassword').callsFake((oldPass, newPass, callback) => {
      assert.equal(oldPass, 'oldpass');
      assert.equal(newPass, 'newpass');
      callback(null, 'SUCCESS');
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.changePassword('oldpass', 'newpass');
  });

  sinonTest('confirmPassword', async function(assert) {
    assert.expect(2);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'confirmPassword').callsFake((code, password, callback) => {
      assert.equal(code, '1234');
      assert.equal(password, 'newpass');
      callback.onSuccess();
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.confirmPassword('1234', 'newpass');
  });

  sinonTest('confirmRegistration', async function(assert) {
    assert.expect(3);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'confirmRegistration').callsFake((code, force, callback) => {
      assert.equal(code, '1234');
      assert.strictEqual(force, true);
      callback(null, 'SUCCESS');
    });
    let user = CognitoUser.create({ user: awsUser });
    let text = await user.confirmRegistration('1234', true);
    assert.equal(text, 'SUCCESS');
  });

  sinonTest('deleteAttributes', async function(assert) {
    assert.expect(1);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'deleteAttributes').callsFake((attributeList, callback) => {
      assert.deepEqual(attributeList, ['first_name', 'last_name']);
      callback(null, 'SUCCESS');
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.deleteAttributes(['first_name', 'last_name']);
  });

  sinonTest('forgotPassword', async function(assert) {
    assert.expect(2);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'forgotPassword').callsFake((callback) => {
      assert.ok(callback.onFailure);
      assert.ok(callback.onSuccess);
      callback.onSuccess();
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.forgotPassword();
  });
  sinonTest('forgotPassword exception', async function(assert) {
    assert.expect(1);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'forgotPassword').callsFake(() => {
      throw('some error');
    });
    let user = CognitoUser.create({ user: awsUser });

    try {
      await user.forgotPassword();
    } catch (err) {
      assert.equal(err, 'some error');
    }
  });

  sinonTest('getAttributeVerificationCode', async function(assert) {
    assert.expect(3);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'getAttributeVerificationCode').callsFake((attrName, callback) => {
      assert.equal(attrName, 'email');
      assert.ok(callback.onFailure);
      assert.ok(callback.onSuccess);
      callback.onSuccess();
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.getAttributeVerificationCode('email');
  });

  sinonTest('getAttributeVerificationCode error', async function(assert) {
    assert.expect(4);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'getAttributeVerificationCode').callsFake((attrName, callback) => {
      assert.equal(attrName, 'email');
      assert.ok(callback.onFailure);
      assert.ok(callback.onSuccess);
      callback.onFailure('some error');
    });
    let user = CognitoUser.create({ user: awsUser });
    try {
      await user.getAttributeVerificationCode('email');
    } catch (err) {
      assert.equal(err, 'some error');
    }
  });

  sinonTest('getUserAttributes', async function(assert) {
    let awsUser = getAwsUser();
    this.stub(awsUser, 'getUserAttributes').callsFake((callback) => {
      // This should return an instance of a CognitoUserSession.
      callback(null, [
        new CognitoUserAttribute({ Name: 'sub', Value: 'aaaaaaaa-bbbb-cccc-dddd-eeeeffffgggg' }),
        new CognitoUserAttribute({ Name: 'email_verified', Value: true })
      ]);
    });
    let user = CognitoUser.create({ user: awsUser });
    let attrs = await user.getUserAttributes();
    assert.equal(attrs.length, 2);
  });

  sinonTest('getUserAttributes error', async function(assert) {
    let awsUser = getAwsUser();
    this.stub(awsUser, 'getUserAttributes').callsFake((callback) => {
      callback('error', null);
    });
    let user = CognitoUser.create({ user: awsUser });
    try {
      await user.getUserAttributes();
      assert.ok(false);
    } catch (err) {
      assert.equal(err, 'error');
    }
  });

  sinonTest('resendConformationCode', async function(assert) {
    let awsUser = getAwsUser();
    this.stub(awsUser, 'resendConfirmationCode').callsFake((callback) => {
      callback(null, 'SUCCESS');
    });
    let user = CognitoUser.create({ user: awsUser });
    let text = await user.resendConfirmationCode();
    assert.equal(text, 'SUCCESS');
  });

  sinonTest('updateAttributes', async function(assert) {
    assert.expect(1);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'updateAttributes').callsFake((attributeList, callback) => {
      assert.deepEqual(attributeList, []);
      callback(null, 'SUCCESS');
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.updateAttributes([]);
  });

  sinonTest('verifyAttribute', async function(assert) {
    assert.expect(2);

    let awsUser = getAwsUser();
    this.stub(awsUser, 'verifyAttribute').callsFake((attrName, code, callback) => {
      assert.equal(attrName, 'email');
      assert.equal(code, '1234');
      callback.onSuccess();
    });
    let user = CognitoUser.create({ user: awsUser });
    await user.verifyAttribute('email', '1234');
  });

  sinonTest('getGroups', async function(assert) {
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
    let groups = await user.getGroups();
    assert.deepEqual(groups, ['Group 1', 'Group 2']);
  });

  sinonTest('getGroups no groups', async function(assert) {
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
    let groups = await user.getGroups();
    assert.deepEqual(groups, []);
  });

  sinonTest('signOut and getStorageData()', function(assert) {
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
});
