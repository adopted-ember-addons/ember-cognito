import {
  CognitoAccessToken, CognitoIdToken, CognitoRefreshToken, CognitoUserSession
} from "amazon-cognito-identity-js";

// Makes a JWT from a payload
export function makeToken(duration = 1000, header = 'header') {
  const now = Math.floor(new Date() / 1000);
  // To get a non-zero clock drift.
  const iat = now - 123;
  const payload = {
    iat,
    exp: iat + duration
  };
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
