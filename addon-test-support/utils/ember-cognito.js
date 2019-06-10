import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import EmberObject, { get, set } from '@ember/object';
import { resolve } from 'rsvp';
import { newSession } from "./-mock-auth";

const MockUser = EmberObject.extend({
  init() {
    this.userAttributes = this.userAttributes || [];
    this.storageData = this.storageData || {};
  },

  changePassword(/* oldPassword, newPassword */) {
    return resolve({});
  },

  confirmRegistration(/* confirmationCode, forceAliasCreation */) {
    return resolve({});
  },

  confirmPassword(/* verificationCode, newPassword */) {
    return resolve({});
  },

  deleteAttributes(/* attributeList */) {
    return resolve({});
  },

  forgotPassword() {
    return resolve({});
  },

  getAttributeVerificationCode(/* attributeName */) {
    return resolve({});
  },

  getSession() {
    return resolve(this.get('session') || newSession());
  },

  getUserAttributes() {
    return resolve(get(this, 'userAttributes').map(({ name, value }) => {
      return new CognitoUserAttribute({ Name: name, Value: value });
    }));
  },

  resendConfirmationCode() {
    return resolve({});
  },

  signOut() {
    return resolve({});
  },

  updateAttributes(attributeList) {
    let attrs = get(this, 'userAttributes');
    attributeList.forEach((updated) => {
      let found = false;
      attrs.forEach((existing) => {
        if (existing.name === updated.getName()) {
          existing.value = updated.getValue();
          found = true;
        }
      });
      if (!found) {
        attrs.push({ name: updated.getName(), value: updated.getValue() });
      }
    });
    set(this, 'userAttributes', attrs);
    return resolve({});
  },

  verifyAttribute(/* attributeName, confirmationCode */) {
    return resolve({});
  },

  // Non-AWS method
  getGroups() {
    return resolve(get(this, 'groups'));
  },

  // Non-AWS method
  getStorageData() {
    return get(this, 'storageData');
  }
});

export { MockUser };
