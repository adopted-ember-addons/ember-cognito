import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';

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
    this.get('cognito')._setUser(user);
    // TODO: Do we want to actually put the tokens in the auth data anymore?
    // They won't be refreshed, so they will be invalid after an hour.
    return { "poolId": user.pool.getUserPoolId(), "clientId": user.pool.getClientId() };
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
      // TODO: Handle other challenge states...
    } else {
      return this._resolveAuth(user);
    }
  },

  _handleNewPasswordRequired({ password, state: { user } }) {
    return this.get('auth').completeNewPassword(user, password).then((user) => {
      return this._handleSignIn(user);
    });
  },

  _handleState(name, params) {
    if (name === 'newPasswordRequired') {
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
    return  this.get('auth').signOut().then(() => {
      this.set('cognito.user', undefined);
      return data;
    });
  }
});
