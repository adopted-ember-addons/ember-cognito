/* eslint-disable ember/no-runloop */
import Service, { inject as service } from '@ember/service';
import CognitoUser from '../utils/cognito-user';
import { normalizeAttributes } from '../utils/utils';
import Auth from '@aws-amplify/auth';
import { set } from '@ember/object';
import { cancel, later } from '@ember/runloop';
import { reject } from 'rsvp';

/**
 * @public
 * This is a container for easily accessing the logged-in CognitoUser object,
 * as well as creating others using signUp().
 */
export default class CognitoService extends Service {
  @service session;
  auth = Auth;

  willDestroy() {
    super.willDestroy(...arguments);
    this.stopRefreshTask();
  }

  /**
   * Configures the Amplify library with the pool & client IDs, and any additional
   * configuration.
   * @param awsconfig Extra AWS configuration.
   */
  configure(awsconfig) {
    const { poolId, clientId } = this;
    const params = Object.assign(
      {
        userPoolId: poolId,
        userPoolWebClientId: clientId,
      },
      awsconfig,
    );

    this.auth.configure(params);
  }

  /**
   * Method for signing up a user.
   *
   * @param username User's username
   * @param password Plain-text initial password entered by user.
   * @param attributes New user attributes.
   * @param validationData Application metadata.
   */
  async signUp(username, password, attributes, validationData) {
    this.configure();
    const result = await this.auth.signUp({
      username,
      password,
      attributes: normalizeAttributes(attributes),
      validationData,
    });
    // Replace the user with a wrapped user.
    result.user = this._setUser(result.user);
    return result;
  }

  /**
   * Confirm signup for user.
   * @param username User's username.
   * @param code The confirmation code.
   * @returns {Promise<any>}
   */
  confirmSignUp(username, code, options) {
    this.configure();
    return this.auth.confirmSignUp(username, code, options);
  }

  /**
   * Resends the sign up code.
   * @param username User's username.
   * @returns {*|Promise<string>}
   */
  resendSignUp(username) {
    this.configure();
    return this.auth.resendSignUp(username);
  }

  /**
   * Sends a user a code to reset their password.
   * @param username
   * @returns {*|Promise<any>|RSVP.Promise|void}
   */
  forgotPassword(username) {
    this.configure();
    return this.auth.forgotPassword(username);
  }

  /**
   * Submits a new password.
   * @param username User's username.
   * @param code The verification code sent by forgotPassword.
   * @param newPassword The user's new password.
   * @returns {*|Promise<void>|void}
   */
  forgotPasswordSubmit(username, code, newPassword) {
    this.configure();
    return this.auth.forgotPasswordSubmit(username, code, newPassword);
  }

  /**
   * Enable the token refresh timer.
   */
  startRefreshTask(session) {
    if (!this.autoRefreshSession) {
      return;
    }
    // Schedule a task for just past when the token expires.
    const now = Math.floor(new Date() / 1000);
    const exp = session.getIdToken().getExpiration();
    const adjusted = now - session.getClockDrift();
    const duration = (exp - adjusted) * 1000 + 100;
    set(this, '_taskDuration', duration);
    set(this, 'task', later(this, 'refreshSession', duration));
  }

  /**
   * Disable the token refresh timer.
   */
  stopRefreshTask() {
    cancel(this.task);
    set(this, 'task', undefined);
    set(this, '_taskDuration', undefined);
  }

  refreshSession() {
    let user = this.user;
    if (user) {
      return this.session.authenticate('authenticator:cognito', {
        state: { name: 'refresh' },
      });
    }
  }

  /**
   * A helper that resolves to the logged in user's id token.
   */
  async getIdToken() {
    const user = this.user;
    if (user) {
      const session = await user.getSession();
      return session.getIdToken().getJwtToken();
    } else {
      return reject('user not authenticated');
    }
  }

  _setUser(awsUser) {
    // Creates and sets the Cognito user.
    const user = CognitoUser.create({ auth: this.auth, user: awsUser });
    set(this, 'user', user);
    return user;
  }
}
