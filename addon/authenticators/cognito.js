import { get } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';
import { reject } from 'rsvp';

export default Base.extend({
  cognito: service(),
  auth: readOnly('cognito.auth'),
  poolId: readOnly('cognito.poolId'),
  clientId: readOnly('cognito.clientId'),
  authenticationFlowType: readOnly('cognito.authenticationFlowType'),

  restore({ poolId, clientId }) {
    this.get('cognito').configure({
      userPoolId: poolId,
      userPoolWebClientId: clientId
    });
    return this.get('auth').currentAuthenticatedUser().then((user) => {
      return this._resolveAuth(user);
    });
  },

  _resolveAuth(user) {
    const cognito = this.get('cognito');
    cognito._setUser(user);
    // Now pull out the (promisified) user
    return get(cognito, 'user').getSession().then((session) => {
      /* eslint-disable camelcase */
      cognito.startRefreshTask(session);
      return {
        poolId: user.pool.getUserPoolId(),
        clientId: user.pool.getClientId(),
        access_token: session.getIdToken().getJwtToken()
      };
    });
  },

  _handleSignIn(user) {
    // console.log(user);
    if (user.challengeName) {
      // This is mainly for backward compat
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        throw { state: { name: 'newPasswordRequired', user } };
      } else {
        throw { state: { name: user.challengeName, user } };
      }
    } else {
      return this._resolveAuth(user);
    }
  },

  _handleNewPasswordRequired({ password, state: { user } }) {
    return this.get('auth').completeNewPassword(user, password).then((user) => {
      return this._handleSignIn(user);
    });
  },

  _handleRefresh() {
    const cognito = this.get('cognito');
    const user = get(cognito, 'user');
    // Get the session, which will refresh it if necessary
    return user.getSession().then((session) => {
      if (session.isValid()) {
        /* eslint-disable camelcase */

        cognito.startRefreshTask(session);
        return get(cognito, 'auth').currentAuthenticatedUser().then((awsUser) => {
          return {
            poolId: awsUser.pool.getUserPoolId(),
            clientId: awsUser.pool.getClientId(),
            access_token: session.getIdToken().getJwtToken()
          };
        });
      } else {
        return reject('session is invalid');
      }
    });
  },

  _handleState(name, params) {
    if (name === 'refresh') {
      return this._handleRefresh();
    } else if (name === 'newPasswordRequired') {
      return this._handleNewPasswordRequired(params);
    } else {
      throw new Error('invalid state');
    }
  },

  authenticate(params) {
    const { username, password, state } = params;
    if (state) {
      return this._handleState(state.name, params);
    }

    const { auth, authenticationFlowType } =
      this.getProperties('auth', 'authenticationFlowType');
    this.get('cognito').configure({ authenticationFlowType });

    return auth.signIn(username, password).then((user) => {
      return this._handleSignIn(user);
    });
  },

  invalidate(data) {
    return  this.get('cognito.user').signOut().then(() => {
      this.set('cognito.user', undefined);
      return data;
    });
  }
});
