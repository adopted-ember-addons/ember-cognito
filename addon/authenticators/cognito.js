import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';

export default class CognitoAuthenticator extends Base {
  @service cognito;
  @readOnly('cognito.auth') auth;
  @readOnly('cognito.poolId') poolId;
  @readOnly('cognito.clientId') clientId;
  @readOnly('cognito.authenticationFlowType') authenticationFlowType;

  async restore({ poolId, clientId }) {
    this.cognito.configure({
      userPoolId: poolId,
      userPoolWebClientId: clientId,
    });
    const user = await this.auth.currentAuthenticatedUser();
    return this._resolveAuth(user);
  }

  _makeAuthData(user, session) {
    return {
      poolId: user.pool.getUserPoolId(),
      clientId: user.pool.getClientId(),
      access_token: session.getIdToken().getJwtToken(),
    };
  }

  async _resolveAuth(user) {
    const { cognito } = this;
    cognito._setUser(user);
    // Now pull out the (promisified) user
    const session = await cognito.user.getSession();
    cognito.startRefreshTask(session);
    return this._makeAuthData(user, session);
  }

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
  }

  async _handleNewPasswordRequired({ password, state: { user } }) {
    const user2 = await this.auth.completeNewPassword(user, password);
    return this._handleSignIn(user2);
  }

  async _handleRefresh() {
    const { cognito } = this;
    const { auth, user } = cognito;
    // Get the session, which will refresh it if necessary
    const session = await user.getSession();
    if (session.isValid()) {
      cognito.startRefreshTask(session);
      const awsUser = await auth.currentAuthenticatedUser();
      return this._makeAuthData(awsUser, session);
    } else {
      throw new Error('session is invalid');
    }
  }

  _handleState(name, params) {
    if (name === 'refresh') {
      return this._handleRefresh();
    } else if (name === 'newPasswordRequired') {
      return this._handleNewPasswordRequired(params);
    } else {
      throw new Error('invalid state');
    }
  }

  async authenticate(params) {
    const { username, password, state } = params;
    if (state) {
      return this._handleState(state.name, params);
    }

    const { auth, authenticationFlowType, cognito } = this;
    cognito.configure({ authenticationFlowType });

    const user = await auth.signIn(username, password);
    return this._handleSignIn(user);
  }

  async invalidate(data) {
    await this.cognito.user.signOut();
    this.set('cognito.user', undefined);
    return data;
  }
}
