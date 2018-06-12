import { Promise } from 'rsvp';
import EmberObject, { get, computed } from '@ember/object';

//
// Wraps an AWS CognitoUser and provides promisified versions of many functions.
//
export default EmberObject.extend({
  username: computed('user', function() {
    return this.get('user').getUsername();
  }),

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

  // Support for methods that user { onSuccess, onFailure } callback hashes
  _callbackObj(method, ...args) {
    return new Promise((resolve, reject) => {
        try {
          this.get('user')[method](...args, {
            onSuccess: resolve,
            onFailure: reject
          });
        } catch (error) {
          reject(error);
        }
      }, `cognito-user#${method}`);

  },

  changePassword(oldPassword, newPassword) {
    return this._callback('changePassword', oldPassword, newPassword)
  },

  confirmRegistration(confirmationCode, forceAliasCreation) {
    return this._callback('confirmRegistration', confirmationCode, forceAliasCreation);
  },

  confirmPassword(verificationCode, newPassword) {
    return this._callbackObj('confirmPassword', verificationCode, newPassword);
  },

  deleteAttributes(attributeList) {
    return this._callback('deleteAttributes', attributeList);
  },

  forgotPassword() {
    return this._callbackObj('forgotPassword');
  },

  getAttributeVerificationCode(attributeName) {
    return this._callbackObj('getAttributeVerificationCode', attributeName);
  },

  getSession() {
    return this._callback('getSession');
  },

  getUserAttributes() {
    return this._callback('getUserAttributes');
  },

  resendConfirmationCode() {
    return this._callback('resendConfirmationCode');
  },

  signOut() {
    return get(this, 'user').signOut();
  },

  updateAttributes(attributeList) {
    return this._callback('updateAttributes', attributeList);
  },

  verifyAttribute(attributeName, confirmationCode) {
    return this._callbackObj('verifyAttribute', attributeName, confirmationCode);
  },

  // Non-AWS method
  getGroups() {
    return this.getSession().then((session) => {
      let payload = session.getIdToken().payload || {};
      return payload['cognito:groups'] || [];
    });
  },

  // Non-AWS method
  getStorageData() {
    return get(this, 'user').storage.getData();
  }
});
