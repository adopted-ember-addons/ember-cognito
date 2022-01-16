import { Promise } from 'rsvp';
import EmberObject, { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { deprecate } from '@ember/debug';
import { normalizeAttributes } from './utils';

//
// Wraps an AWS CognitoUser.
//
export default class CognitoUser extends EmberObject {
  @computed('user')
  get username() {
    return this.user.getUsername();
  }
  @readOnly('user.attributes') attributes;

  _callback(method, ...args) {
    return new Promise((resolve, reject) => {
      try {
        this.user[method](...args, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    }, `cognito-user#${method}`);
  }

  changePassword(oldPassword, newPassword) {
    const { auth, user } = this;
    return auth.changePassword(user, oldPassword, newPassword);
  }

  confirmPassword(verificationCode, newPassword) {
    deprecate(
      'This functionality has moved to forgotPasswordSubmit() on the Cognito service.',
      false,
      {
        for: 'ember-cognito',
        id: 'ember-cognito-confirm-password',
        since: '0.12.0',
        until: '1.0.0',
      }
    );

    const { auth, username } = this;
    return auth.forgotPasswordSubmit(username, verificationCode, newPassword);
  }

  confirmRegistration(confirmationCode, forceAliasCreation) {
    deprecate(
      'This functionality has moved to confirmSignUp() on the Cognito service.',
      false,
      {
        for: 'ember-cognito',
        id: 'ember-cognito-confirm-registration',
        since: '0.12.0',
        until: '1.0.0',
      }
    );

    const { auth, username } = this;
    const options = forceAliasCreation
      ? { forceAliasCreation: true }
      : undefined;
    return auth.confirmSignUp(username, confirmationCode, options);
  }

  deleteAttributes(attributeList) {
    return this._callback('deleteAttributes', attributeList);
  }

  deleteUser() {
    return this._callback('deleteUser');
  }

  forgotPassword() {
    deprecate(
      'This functionality has moved to forgotPassword() on the Cognito service.',
      false,
      {
        for: 'ember-cognito',
        id: 'ember-cognito-forgot-password',
        since: '0.12.0',
        until: '1.0.0',
      }
    );

    const { auth, username } = this;
    return auth.forgotPassword(username);
  }

  getAttributeVerificationCode(attributeName) {
    const { auth, user } = this;
    return auth.verifyUserAttribute(user, attributeName);
  }

  getSession() {
    return this.auth.currentSession();
  }

  getUserAttributes() {
    const { auth, user } = this;
    return auth.userAttributes(user);
  }

  async getUserAttributesHash() {
    const { auth, user } = this;
    const result = await auth.userAttributes(user);
    return normalizeAttributes(result, false);
  }

  resendConfirmationCode() {
    deprecate(
      'This functionality has moved to resendSignUp() on the Cognito service.',
      false,
      {
        for: 'ember-cognito',
        id: 'ember-cognito-resend-confirmation-code',
        since: '0.12.0',
        until: '1.0.0',
      }
    );

    const { auth, username } = this;
    return auth.resendSignUp(username);
  }

  signOut() {
    return this.auth.signOut();
  }

  updateAttributes(attributes) {
    const { auth, user } = this;
    const normalized = normalizeAttributes(attributes);
    return auth.updateUserAttributes(user, normalized);
  }

  verifyAttribute(attributeName, confirmationCode) {
    const { auth, user } = this;
    return auth.verifyUserAttributeSubmit(
      user,
      attributeName,
      confirmationCode
    );
  }

  // Non-AWS method
  async getGroups() {
    const session = await this.getSession();
    let payload = session.getIdToken().payload || {};
    return payload['cognito:groups'] || [];
  }

  getStorageData() {
    deprecate(
      'getStorageData() no longer used, and always returns an empty object.',
      false,
      {
        for: 'ember-cognito',
        id: 'ember-cognito-get-storage-data',
        since: '0.12.0',
        until: '1.0.0',
      }
    );
    return {};
  }
}
