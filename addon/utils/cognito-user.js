import { Promise } from 'rsvp';
import EmberObject, { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { deprecate } from '@ember/application/deprecations';
import { normalizeAttributes } from "./utils";

//
// Wraps an AWS CognitoUser.
//
export default EmberObject.extend({
  username: computed('user', function() {
    return this.get('user').getUsername();
  }),
  attributes: readOnly("user.attributes"),

  _callback(method, ...args) {
    return new Promise((resolve, reject) => {
      try {
        this.get('user')[method](...args, (err, result) => {
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
  },

  changePassword(oldPassword, newPassword) {
    const { auth, user } = this.getProperties('auth', 'user');
    return auth.changePassword(user, oldPassword, newPassword);
  },

  confirmPassword(verificationCode, newPassword) {
    deprecate(
      'This functionality has moved to forgotPasswordSubmit() on the Cognito service.',
      false,
      { id: 'ember-cognito-confirm-password', until: '1.0' }
    );

    const { auth, username } = this.getProperties('auth', 'username');
    return auth.forgotPasswordSubmit(username, verificationCode, newPassword);
  },

  confirmRegistration(confirmationCode, forceAliasCreation) {
    deprecate(
      'This functionality has moved to confirmSignUp() on the Cognito service.',
      false,
      { id: 'ember-cognito-confirm-registration', until: '1.0' }
    );

    const { auth, username } = this.getProperties('auth', 'username');
    const options = forceAliasCreation ? { forceAliasCreation : true } : undefined;
    return auth.confirmSignUp(username, confirmationCode, options);
  },

  deleteAttributes(attributeList) {
    return this._callback('deleteAttributes', attributeList);
  },

  deleteUser() {
    return this._callback('deleteUser');
  },

  forgotPassword() {
    deprecate(
      'This functionality has moved to forgotPassword() on the Cognito service.',
      false,
      { id: 'ember-cognito-forgot-password', until: '1.0' }
    );

    const { auth, username } = this.getProperties('auth', 'username');
    return auth.forgotPassword(username);
  },

  getAttributeVerificationCode(attributeName) {
    const { auth, user } = this.getProperties('auth', 'user');
    return auth.verifyUserAttribute(user, attributeName);
  },

  getSession() {
    return this.get('auth').currentSession();
  },

  getUserAttributes() {
    const { auth, user } = this.getProperties('auth', 'user');
    return auth.userAttributes(user);
  },

  getUserAttributesHash() {
    const { auth, user } = this.getProperties('auth', 'user');
    return auth.userAttributes(user).then((result) => {
      return normalizeAttributes(result, false);
    });
  },

  resendConfirmationCode() {
    deprecate(
      'This functionality has moved to resendSignUp() on the Cognito service.',
      false,
      { id: 'ember-cognito-resend-confirmation-code', until: '1.0' }
    );

    const { auth, username } = this.getProperties('auth', 'username');
    return auth.resendSignUp(username);
  },

  signOut() {
    return this.get('auth').signOut();
  },

  updateAttributes(attributes) {
    const { auth, user } = this.getProperties('auth', 'user');
    const normalized = normalizeAttributes(attributes);
    return auth.updateUserAttributes(user, normalized);
  },

  verifyAttribute(attributeName, confirmationCode) {
    const { auth, user } = this.getProperties('auth', 'user');
    return auth.verifyUserAttributeSubmit(user, attributeName, confirmationCode);
  },

  // Non-AWS method
  getGroups() {
    return this.getSession().then((session) => {
      let payload = session.getIdToken().payload || {};
      return payload['cognito:groups'] || [];
    });
  },

  getStorageData() {
    deprecate(
      'getStorageData() no longer used, and always returns an empty object.',
      false,
      { id: 'ember-cognito-get-storage-data', until: '1.0' }
    );
    return {};
  }
});
