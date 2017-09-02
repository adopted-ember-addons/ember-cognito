import { AuthenticationDetails } from 'amazon-cognito-identity-js';
import { CognitoUser as AWSCognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import Base from 'ember-simple-auth/authenticators/base';
import CognitoStorage from '../utils/cognito-storage';
import CognitoUser from '../utils/cognito-user';
import Ember from 'ember';

const {
  computed: { readOnly },
  inject: { service },
  merge,
  RSVP,
  set,
  getProperties
} = Ember;

export default Base.extend({
  cognito: service(),
  poolId: readOnly('cognito.poolId'),
  clientId: readOnly('cognito.clientId'),

  _stubUser(user) {
    return user;
  },

  _getCurrentUser(data) {
    let pool = new CognitoUserPool({
      UserPoolId: data.poolId,
      ClientId: data.clientId,
      Storage: new CognitoStorage(data)
    });
    let user = pool.getCurrentUser();
    if (!user) {
      return null;
    }
    return CognitoUser.create({ user: this._stubUser(user) });
  },

  restore(data) {
    let user = this._getCurrentUser(data);
    if (user) {
      return user.getSession().then((session) => {
        if (session.isValid()) {
          /* eslint-disable camelcase */
          set(this, 'cognito.user', user);
          // Resolve with the new data the user set, in case
          // the session needed to be refreshed.
          let newData = user.getStorageData();
          newData.access_token = session.getIdToken().getJwtToken();
          return newData;
        } else {
          return RSVP.reject('session is invalid');
        }
      });
    }
    return RSVP.reject('no current user');
  },

  _resolveAuth(resolve, result, { pool, user }) {
    /* eslint-disable camelcase */

    // Make sure to put the idToken in a place where the DataAdapterMixin wants it (access_token)
    // Add any data that's from the user's and pool's storage.
    let data = merge({
      access_token: result.getIdToken().getJwtToken(),
      poolId: pool.getUserPoolId(),
      clientId: pool.getClientId()
    }, pool.storage.getData());

    set(this, 'cognito.user', CognitoUser.create({ user }));
    resolve(data);
  },

  authenticate({ username, password, state }) {
    if (state && state.name === 'newPasswordRequired') {
      return new RSVP.Promise((resolve, reject) => {
        let that = this;
        state.user.completeNewPasswordChallenge(password, state.userAttributes, {
          onSuccess(result) {
            that._resolveAuth(resolve, result, state);
          },
          onFailure(err) {
            reject(err);
          }
        });
      }, 'cognito:newPasswordRequired');

    } else {
      return new RSVP.Promise((resolve, reject) => {
        let that = this;

        let { poolId, clientId } = getProperties(this, 'poolId', 'clientId');
        let pool = new CognitoUserPool({
          UserPoolId: poolId,
          ClientId: clientId,
          Storage: new CognitoStorage({})
        });
        let user = this._stubUser(new AWSCognitoUser({ Username: username, Pool: pool, Storage: pool.storage }));
        let authDetails = new AuthenticationDetails({ Username: username, Password: password });

        user.authenticateUser(authDetails, {
          onSuccess(result) {
            that._resolveAuth(resolve, result, { pool, user });
          },
          onFailure(err) {
            reject(err);
          },
          newPasswordRequired(userAttributes /* , requiredAttributes */) {
            // ember-simple-auth doesn't allow a "half" state like this --
            // the promise either resolves, or rejects.
            // In this case, we have to reject, because we can't let
            // ember-simple-auth think that the user is successfully
            // authenticated.
            delete userAttributes.email_verified;
            reject({
              state: {
                name: 'newPasswordRequired',
                user,
                userAttributes,
                pool
              }
            });
          }
        });
      }, 'cognito:authenticate');
    }
  },

  invalidate(data) {
    let user = this._getCurrentUser(data);
    user.signOut();
    set(this, 'cognito.user', undefined);
    return RSVP.resolve(data);
  }
});
