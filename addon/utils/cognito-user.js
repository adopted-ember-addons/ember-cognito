import EmberObject from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { deprecate } from '@ember/debug';
import { normalizeAttributes } from './utils';
import { tracked } from '@glimmer/tracking';

//
// Wraps an AWS CognitoUser.
//
export default class CognitoUser extends EmberObject {
  @tracked user;

  get username() {
    return this.user.username;
  }

  @readOnly('user.attributes') attributes;

  changePassword(oldPassword, newPassword) {
    const { auth } = this;
    return auth.updatePassword({ oldPassword, newPassword });
  }

  confirmPassword(confirmationCode, newPassword) {
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
    return auth.confirmResetPassword({
      username,
      confirmationCode,
      newPassword,
    });
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
    return auth.confirmSignUp({ username, confirmationCode, options });
  }

  async deleteAttributes(attributes) {
    this.auth.deleteuserAttributes({
      attributes,
    });
  }

  async deleteUser() {
    return await this.auth.deleteUser();
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
    return auth.forgotPassword({ username });
  }

  getAttributeVerificationCode(userAttributeKey) {
    const { auth } = this;
    return auth.sendUserAttributeVerificationCode({ userAttributeKey });
  }

  async getSession() {
    return this.auth.fetchAuthSession();
  }

  async getUserAttributes() {
    const { auth } = this;
    const attributes = await auth.fetchUserAttributes();
    return attributes;
  }

  async getUserAttributesHash() {
    const attributes = await this.getUserAttributes();
    return normalizeAttributes(attributes, false);
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
    return auth.resendSignUp({ username });
  }

  signOut() {
    return this.auth.signOut();
  }

  updateAttributes(attributes) {
    const { auth } = this;
    const userAttributes = normalizeAttributes(attributes);
    return auth.updateUserAttributes({ userAttributes });
  }

  verifyAttribute(userAttributeKey, confirmationCode) {
    const { auth } = this;

    return auth.confirmUserAttribute({
      userAttributeKey,
      confirmationCode,
    });
  }

  // Non-AWS method
  async getGroups() {
    const session = await this.getSession();
    let payload = session.tokens.idToken?.payload || {};
    return payload['cognito:groups'] || [];
  }
}
