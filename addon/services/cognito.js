import Service, { inject as service } from '@ember/service';
import { assign } from '@ember/polyfills';
import CognitoUser from '../utils/cognito-user';
import { normalizeAttributes } from "../utils/utils";
import Auth from "@aws-amplify/auth";
import { cancel, later } from '@ember/runloop';
import { reject } from 'rsvp';

/**
 * @public
 * This is a container for easily accessing the logged-in CognitoUser object,
 * as well as creating others using signUp().
 */
export default Service.extend({
  session: service(),
  auth: Auth,

  willDestroy() {
    this._super(...arguments);
    this.stopRefreshTask();
  },

  /**
   * Configures the Amplify library with the pool & client IDs, and any additional
   * configuration.
   * @param awsconfig Extra AWS configuration.
   */
  configure(awsconfig) {
    const { poolId, clientId } = this.getProperties('poolId', 'clientId');
    const params =  assign({
      userPoolId: poolId,
      userPoolWebClientId: clientId,
    }, awsconfig);

    this.get('auth').configure(params);
  },

  /**
   * Method for signing up a user.
   *
   * @param username User's username
   * @param password Plain-text initial password entered by user.
   * @param attributes New user attributes.
   * @param validationData Application metadata.
   */
  signUp(username, password, attributes, validationData) {
    this.configure();

    return this.get('auth').signUp({
      username,
      password,
      attributes: normalizeAttributes(attributes),
      validationData
    }).then((result) => {
      // Replace the user with a wrapped user.
      result.user = this._setUser(result.user);
      return result;
    });
  },

  /**
   * Confirm signup for user.
   * @param username User's username.
   * @param code The confirmation code.
   * @returns {Promise<any>}
   */
  confirmSignUp(username, code, options) {
    this.configure();
    return this.get('auth').confirmSignUp(username, code, options);
  },

  /**
   * Resends the sign up code.
   * @param username User's username.
   * @returns {*|Promise<string>}
   */
  resendSignUp(username) {
    this.configure();
    return this.get('auth').resendSignUp(username);
  },

  /**
   * Sends a user a code to reset their password.
   * @param username
   * @returns {*|Promise<any>|RSVP.Promise|void}
   */
  forgotPassword(username) {
    this.configure();
    return this.get('auth').forgotPassword(username);
  },

  /**
   * Submits a new password.
   * @param username User's username.
   * @param code The verification code sent by forgotPassword.
   * @param newPassword The user's new password.
   * @returns {*|Promise<void>|void}
   */
  forgotPasswordSubmit(username, code, newPassword) {
    this.configure();
    return this.get('auth').forgotPasswordSubmit(username, code, newPassword);
  },

  /**
   * Enable the token refresh timer.
   */
  startRefreshTask(session) {
    if (!this.get('autoRefreshSession')) {
      return;
    }
    // Schedule a task for just past when the token expires.
    const now = Math.floor(new Date() / 1000);
    const exp = session.getIdToken().getExpiration();
    const adjusted = now - session.getClockDrift();
    const duration = (exp - adjusted) * 1000 + 100;
    this.set('_taskDuration', duration);
    this.set('task', later(this, 'refreshSession', duration));
  },

  /**
   * Disable the token refresh timer.
   */
  stopRefreshTask() {
    cancel(this.get('task'));
    this.set('task', undefined);
    this.set('_taskDuration', undefined);
  },

  refreshSession() {
    let user = this.get('user');
    if (user) {
      return this.get('session').authenticate('authenticator:cognito', { state: { name: 'refresh' } });
    }
  },

  /**
   * A helper that resolves to the logged in user's id token.
   */
  getIdToken() {
    const user = this.get('user');
    if (user) {
      return user.getSession().then((session) => {
        return session.getIdToken().getJwtToken();
      })
    } else {
      return reject('user not authenticated');
    }
  },

  _setUser(awsUser) {
    // Creates and sets the Cognito user.
    const user = CognitoUser.create({ auth: this.get('auth'), user: awsUser });
    this.set('user', user);
    return user;
  }
});
