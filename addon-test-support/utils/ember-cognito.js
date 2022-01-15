import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import EmberObject, { set } from '@ember/object';
import { typeOf } from '@ember/utils';
import { resolve } from 'rsvp';
import { newSession } from './-mock-auth';

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
    return resolve(this.session || newSession());
  },

  getUserAttributes() {
    return resolve(
      this.userAttributes.map(({ name, value }) => {
        return new CognitoUserAttribute({ Name: name, Value: value });
      })
    );
  },

  getUserAttributesHash() {
    return resolve(
      this.userAttributes.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
      }, {})
    );
  },

  resendConfirmationCode() {
    return resolve({});
  },

  signOut() {
    return resolve({});
  },

  _updateAttrsList(attributesList) {
    let attrs = this.userAttributes;
    attributesList.forEach((updated) => {
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
  },

  _updateAttrsHash(attributes) {
    let attrs = this.userAttributes;
    Object.keys(attributes).forEach((name) => {
      let found = false;
      attrs.forEach((existing) => {
        if (existing.name === name) {
          existing.value = attributes[name];
          found = true;
        }
      });
      if (!found) {
        attrs.push({ name, value: attributes[name] });
      }
    });
    set(this, 'userAttributes', attrs);
  },

  updateAttributes(attributes) {
    if (typeOf(attributes) === 'array') {
      this._updateAttrsList(attributes);
    } else if (typeOf(attributes) === 'object') {
      this._updateAttrsHash(attributes);
    } else {
      throw new Error(`Unknown value: ${attributes}`);
    }
    return resolve({});
  },

  verifyAttribute(/* attributeName, confirmationCode */) {
    return resolve({});
  },

  // Non-AWS method
  getGroups() {
    return resolve(this.groups);
  },

  // Non-AWS method
  getStorageData() {
    return this.storageData;
  },
});

export { MockUser };
