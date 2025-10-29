import { getContext } from '@ember/test-helpers';
import { set } from '@ember/object';
import { typeOf } from '@ember/utils';
import {
  CognitoUser as AWSUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import MockAuth from './utils/-mock-auth.js';
import { MockUser } from './utils/ember-cognito.js';

export function newUser(username) {
  const { owner } = getContext();
  const cognito = owner.lookup('service:cognito');
  const { poolId = 'us-east-1_TEST', clientId = 'TEST' } = cognito;
  const pool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId });
  return new AWSUser({ Username: username, Pool: pool });
}

export function mockCognitoUser(userAttributes) {
  const { owner } = getContext();

  const { username } = userAttributes;
  const cognito = owner.lookup('service:cognito');
  const { poolId = 'us-east-1_TEST', clientId = 'TEST' } = cognito;
  const pool = new CognitoUserPool({ UserPoolId: poolId, ClientId: clientId });
  const user = new AWSUser({ Username: username, Pool: pool });
  const auth = MockAuth.create({ _authenticatedUser: user });

  set(cognito, 'auth', auth);
  set(cognito, 'user', MockUser.create(userAttributes));
}

export function unmockCognitoUser() {
  const { owner } = getContext();
  const cognito = owner.lookup('service:cognito');
  set(cognito, 'user', undefined);
}

export function mockAuth(authClassOrInstance = MockAuth) {
  const { owner } = getContext();
  const cognito = owner.lookup('service:cognito');
  const auth =
    typeOf(authClassOrInstance) === 'class'
      ? authClassOrInstance.create()
      : authClassOrInstance;
  set(cognito, 'auth', auth);
}

// Re-export MockUser so everything can be in this new namespace
export { MockUser, MockAuth };
export * from './utils/-mock-auth.js';
