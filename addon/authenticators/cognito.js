import { readOnly } from '@ember/object/computed';
import { set } from '@ember/object';
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
    const user = await this.auth.getCurrentUser();
    return this._resolveAuth(user);
  }

  _makeAuthData(session) {
    return {
      poolId: this.poolId,
      clientId: this.clientId,
      access_token: session.tokens.idToken?.toString(),
    };
  }

  async _resolveAuth() {
    const { cognito } = this;

    const user = await this.auth.getCurrentUser();
    cognito._setUser(user);

    const session = await cognito.getCurrentSession();

    return this._makeAuthData(session);
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
      return this._resolveAuth();
    }
  }

  async _handleNewPasswordRequired({ password, state: { user } }) {
    const user2 = await this.auth.completeNewPassword({ user, password });
    return this._handleSignIn(user2);
  }

  async _handleRefresh() {
    const { cognito } = this;
    const { user } = cognito;

    const session = await user.getSession(); // Get the session, which will refresh it if necessary

    if (session.isValid()) {
      return this._makeAuthData(session);
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

    const authResult = await auth.signIn({ username, password });

    return this._handleSignIn(authResult);
  }

  async invalidate(data) {
    await this.cognito.user.signOut();
    set(this, 'cognito.user', undefined);
    return data;
  }
}
