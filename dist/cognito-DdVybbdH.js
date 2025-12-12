
import { set } from '@ember/object';
import { service } from '@ember/service';
import Base from 'ember-simple-auth/authenticators/base';
import { g, i } from 'decorator-transforms/runtime-esm';

class CognitoAuthenticator extends Base {
  static {
    g(this.prototype, "cognito", [service]);
  }
  #cognito = (i(this, "cognito"), void 0);
  async restore({
    poolId,
    clientId
  }) {
    this.cognito.configure({
      userPoolId: poolId,
      userPoolWebClientId: clientId
    });
    const user = await this.cognito.auth.currentAuthenticatedUser();
    return this._resolveAuth(user);
  }
  _makeAuthData(user, session) {
    return {
      poolId: user.pool.getUserPoolId(),
      clientId: user.pool.getClientId(),
      access_token: session.getIdToken().getJwtToken()
    };
  }
  async _resolveAuth(user) {
    this.cognito._setUser(user);
    // Now pull out the (promisified) user
    const session = await this.cognito.user.getSession();
    this.cognito.startRefreshTask(session);
    return this._makeAuthData(user, session);
  }
  _handleSignIn(user) {
    // console.log(user);
    if (user.challengeName) {
      // This is mainly for backward compat
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        throw {
          state: {
            name: 'newPasswordRequired',
            user
          }
        };
      } else {
        throw {
          state: {
            name: user.challengeName,
            user
          }
        };
      }
    } else {
      return this._resolveAuth(user);
    }
  }
  async _handleNewPasswordRequired({
    password,
    state: {
      user
    }
  }) {
    const user2 = await this.cognito.auth.completeNewPassword(user, password);
    return this._handleSignIn(user2);
  }
  async _handleRefresh() {
    // Get the session, which will refresh it if necessary
    const session = await this.cognito.user.getSession();
    if (session.isValid()) {
      this.cognito.startRefreshTask(session);
      const awsUser = await this.cognito.auth.currentAuthenticatedUser();
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
    const {
      username,
      password,
      state
    } = params;
    if (state) {
      return this._handleState(state.name, params);
    }
    this.cognito.configure({
      authenticationFlowType: this.cognito.authenticationFlowType
    });
    const user = await this.cognito.auth.signIn(username, password);
    return this._handleSignIn(user);
  }
  async invalidate(data) {
    await this.cognito.user.signOut();
    set(this, 'cognito.user', undefined);
    return data;
  }
}

var __glob__0_0 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: CognitoAuthenticator
});

export { CognitoAuthenticator as C, __glob__0_0 as _ };
//# sourceMappingURL=cognito-DdVybbdH.js.map
