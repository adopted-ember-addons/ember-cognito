
import EmberObject, { set } from '@ember/object';
import { CognitoUserSession, CognitoAccessToken, CognitoRefreshToken, CognitoIdToken } from 'amazon-cognito-identity-js';
import { resolve, reject } from 'rsvp';

// Makes a JWT from a payload
function makeToken({
  duration = 1000,
  header = 'header',
  extra = {}
} = {}) {
  const now = Math.floor(new Date() / 1000);
  // To get a non-zero clock drift.
  const iat = now - 123;
  const payload = Object.assign({
    iat,
    exp: iat + duration
  }, extra);
  return `${header}.${btoa(JSON.stringify(payload))}`;
}

// Creates a fake cognito session with a fake JWT
function newSession({
  idToken,
  refreshToken,
  accessToken
} = {}) {
  const token = makeToken();
  return new CognitoUserSession({
    IdToken: new CognitoIdToken({
      IdToken: idToken || token
    }),
    RefreshToken: new CognitoRefreshToken({
      RefreshToken: refreshToken || token
    }),
    AccessToken: new CognitoAccessToken({
      AccessToken: accessToken || token
    })
  });
}
class MockAuth extends EmberObject {
  configure(awsconfig) {
    set(this, 'awsconfig', awsconfig);
  }
  signUp() {
    const user = this._authenticatedUser;
    return resolve({
      user,
      userConfirmed: false,
      userSub: 'xxxx'
    });
  }
  _resolveAuthedUser(msg) {
    const user = this._authenticatedUser;
    if (user) {
      return resolve(user);
    } else {
      return reject(msg);
    }
  }
  signIn() {
    return this._resolveAuthedUser('invalid user');
  }
  signOut() {
    return resolve();
  }
  currentAuthenticatedUser() {
    return this._resolveAuthedUser('user not authenticated');
  }
  completeNewPassword() {
    return this._resolveAuthedUser('invalid user');
  }
  currentSession() {
    const user = this._authenticatedUser;
    if (user) {
      return resolve(newSession());
    } else {
      return reject('user not authenticated');
    }
  }
  userAttributes() {
    return resolve([]);
  }
}

export { MockAuth as default, makeToken, newSession };
//# sourceMappingURL=-mock-auth.js.map
