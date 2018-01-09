import Service from '@ember/service';
import { Promise } from 'rsvp';
import { CognitoUserPool } from "amazon-cognito-identity-js";
import CognitoStorage from '../utils/cognito-storage';
import CognitoUser from '../utils/cognito-user';
import { later, cancel } from '@ember/runloop';
import { inject as service } from '@ember/service';

/**
 * @public
 * This is a container for easily accessing the logged-in CognitoUser object,
 * as well as creating others using signUp().
 */
export default Service.extend({
  session: service(),

  // Primarily used so we can stub methods.
  _stubPool(pool) {
    return pool;
  },

  /**
   * Method for signing up a user.
   *
   * @param username User's username
   * @param password Plain-text initial password entered by user.
   * @param attributeList New user attributes.
   * @param validationData Application metadata.
   */
  signUp(username, password, attributeList, validationData) {
    let { poolId, clientId } = this.getProperties('poolId', 'clientId');
    let pool = this._stubPool(new CognitoUserPool({
      UserPoolId: poolId,
      ClientId: clientId,
      Storage: new CognitoStorage({})
    }));

    return new Promise((resolve, reject) => {
      pool.signUp(username, password, attributeList, validationData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          result.user = CognitoUser.create({ user: result.user });
          resolve(result);
        }
      });
    }, `cognito-service#signUp`);
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
    if (this.isDestroyed) {
      return;
    }
    let user = this.get('user');
    if (user) {
      return this.get('session').authenticate('authenticator:cognito', { state: { name: 'refresh' } });
    }
  }
});
