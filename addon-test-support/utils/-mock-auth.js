import EmberObject from '@ember/object';
import { reject, resolve } from 'rsvp';
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession
} from "amazon-cognito-identity-js";
import { assign } from '@ember/polyfills';

// Makes a JWT from a payload
export function makeToken({ duration = 1000, header = 'header', extra = {} } = {}) {
  const now = Math.floor(new Date() / 1000);
  // To get a non-zero clock drift.
  const iat = now - 123;
  const payload = assign({
    iat,
    exp: iat + duration
  }, extra);
  return `${header}.${btoa(JSON.stringify(payload))}`;
}

// Creates a fake cognito session with a fake JWT
export function newSession({ idToken, refreshToken, accessToken } = {}) {
  const token = makeToken();
  return new CognitoUserSession({
    IdToken: new CognitoIdToken({ IdToken: idToken || token }),
    RefreshToken: new CognitoRefreshToken({ RefreshToken: refreshToken || token }),
    AccessToken: new CognitoAccessToken({ AccessToken: accessToken || token })
  });
}

export default EmberObject.extend({
  configure(awsconfig) {
    this.set("awsconfig", awsconfig);
  },

  signUp() {
    const user = this.get('_authenticatedUser');
    return resolve({ user, userConfirmed: false, userSub: "xxxx" });
  },

  signIn() {
    const user = this.get('_authenticatedUser');
    if (user) {
      return resolve(user);
    } else {
      return reject('invalid user');
    }
  },

  signOut() {
    return resolve();
  },

  currentAuthenticatedUser() {
    const user = this.get('_authenticatedUser');
    if (user) {
      return resolve(user);
    } else {
      return reject("user not authenticated");
    }
  },

  completeNewPassword() {
    const user = this.get('_authenticatedUser');
    if (user) {
      return resolve(user);
    } else {
      return reject('invalid user');
    }
  },

  currentSession() {
    const user = this.get('_authenticatedUser');
    if (user) {
      return resolve(newSession());
    } else {
      return reject('user not authenticated');
    }
  },

  userAttributes() {
    return resolve([]);
  }
});
