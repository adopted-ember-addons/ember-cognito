import { reject, resolve } from 'rsvp';
import EmberObject, { computed, get } from '@ember/object';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { readOnly } from '@ember/object/computed';
import Auth from "@aws-amplify/auth";

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
    // return this._callback('confirmRegistration', confirmationCode, forceAliasCreation);
    return reject("not implemented");
  },

  confirmPassword(verificationCode, newPassword) {
    // return this._callbackObj('confirmPassword', verificationCode, newPassword);
    return reject("not implemented");
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
    // return this._callbackObj('forgotPassword');
    return reject("not implemented");
  },

  getAttributeVerificationCode(attributeName) {
    // return this._callbackObj('getAttributeVerificationCode', attributeName);
    return reject("not implemented");
  },

  getSession() {
    return Auth.currentSession();
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
    // return this._callback('resendConfirmationCode');
    return reject("not implemented");
  },

  signOut() {
    // return get(this, 'user').signOut();
    return reject("not implemented");
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
});
