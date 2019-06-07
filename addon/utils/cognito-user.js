import { reject, resolve } from 'rsvp';
import EmberObject, { computed, get } from '@ember/object';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { readOnly } from '@ember/object/computed';

//
// Wraps an AWS CognitoUser and provides promisified versions of many functions.
//
export default EmberObject.extend({
  username: computed('user', function() {
    return this.get('user').getUsername();
  }),
  attributes: readOnly("user.attributes"),

  changePassword(oldPassword, newPassword) {
    // return this._callback('changePassword', oldPassword, newPassword)
    return reject("not implemented");
  },

  confirmRegistration(confirmationCode, forceAliasCreation) {
    // TODO: Deprecate this, call cognito confirmSignUp
    const { auth, username } = this.getProperties('auth', 'username');
    const options = forceAliasCreation ? { forceAliasCreation : true } : undefined;
    return auth.confirmSignUp(username, confirmationCode, options);
  },

  confirmPassword(verificationCode, newPassword) {
    // TODO: Deprecate this, call cognito.forgotPasswordSubmit
    const { auth, username } = this.getProperties('auth', 'username');
    return auth.forgotPasswordSubmit(username, verificationCode, newPassword);
  },

  deleteAttributes(attributeList) {
    // return this._callback('deleteAttributes', attributeList);
    return reject("not implemented");
  },

  deleteUser() {
    // return this._callback('deleteUser');
    return reject("not implemented");
  },

  forgotPassword() {
    // TODO: Deprecate this, call cognito forgotPassword()
    const { auth, username } = this.getProperties('auth', 'username');
    return auth.forgotPassword(username);
  },

  getAttributeVerificationCode(attributeName) {
    // return this._callbackObj('getAttributeVerificationCode', attributeName);
    return reject("not implemented");
  },

  getSession() {
    return this.get('auth').currentSession();
  },

  getUserAttributes() {
    // TODO: Mark as deprecated
    // Backwards compatibility -- construct a list of CognitoUserAttribute objects
    const attrs = this.get("attributes");
    let result = [];
    for (const attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        result.push(new CognitoUserAttribute({
          Name: attr,
          Value: attrs[attr]
        }))
      }
    }
    return resolve(result);
  },

  resendConfirmationCode() {
    // TODO: Deprecate this, switch to cognito.resendSignUp()
    const { auth, username } = this.getProperties('auth', 'username');
    return auth.resendSignUp(username);
  },

  signOut() {
    return this.get('auth').signOut();
  },

  updateAttributes(attributeList) {
    // return this._callback('updateAttributes', attributeList);
    return reject("not implemented");
  },

  verifyAttribute(attributeName, confirmationCode) {
    // return this._callbackObj('verifyAttribute', attributeName, confirmationCode);
    return reject("not implemented");
  },

  // Non-AWS method
  getGroups() {
    return this.getSession().then((session) => {
      let payload = session.getIdToken().payload || {};
      return payload['cognito:groups'] || [];
    });
  }

  // TODO: re-implement getStorageData()?
});
