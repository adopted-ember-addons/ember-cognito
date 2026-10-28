
import EmberObject, { computed } from '@ember/object';
import { Promise as Promise$1 } from 'rsvp';
import { normalizeAttributes } from './utils.js';
import { n } from 'decorator-transforms/runtime-esm';

/* eslint-disable ember/no-computed-properties-in-native-classes */
class CognitoUser extends EmberObject {
  get username() {
    return this.user.getUsername();
  }
  static {
    n(this.prototype, "username", [computed('user')]);
  }
  get attributes() {
    return this.user.attributes;
  }
  _callback(method, ...args) {
    return new Promise$1((resolve, reject) => {
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
    const {
      auth,
      user
    } = this;
    return auth.changePassword(user, oldPassword, newPassword);
  }
  deleteAttributes(attributeList) {
    return this._callback('deleteAttributes', attributeList);
  }
  deleteUser() {
    return this._callback('deleteUser');
  }
  getAttributeVerificationCode(attributeName) {
    const {
      auth,
      user
    } = this;
    return auth.verifyUserAttribute(user, attributeName);
  }
  getSession() {
    return this.auth.currentSession();
  }
  getUserAttributes() {
    const {
      auth,
      user
    } = this;
    return auth.userAttributes(user);
  }
  async getUserAttributesHash() {
    const {
      auth,
      user
    } = this;
    const result = await auth.userAttributes(user);
    return normalizeAttributes(result, false);
  }
  signOut() {
    return this.auth.signOut();
  }
  updateAttributes(attributes) {
    const {
      auth,
      user
    } = this;
    const normalized = normalizeAttributes(attributes);
    return auth.updateUserAttributes(user, normalized);
  }
  verifyAttribute(attributeName, confirmationCode) {
    const {
      auth,
      user
    } = this;
    return auth.verifyUserAttributeSubmit(user, attributeName, confirmationCode);
  }

  // Non-AWS method
  async getGroups() {
    const session = await this.getSession();
    let payload = session.getIdToken().payload || {};
    return payload['cognito:groups'] || [];
  }
}

export { CognitoUser as default };
//# sourceMappingURL=cognito-user.js.map
