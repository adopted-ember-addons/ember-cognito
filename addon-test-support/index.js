import { getContext } from '@ember/test-helpers';
import { getProperties, set } from '@ember/object';
import { MockUser } from './utils/ember-cognito';
import MockAuth from './utils/-mock-auth';
import { CognitoUser as AWSUser, CognitoUserPool } from 'amazon-cognito-identity-js';

export function mockCognitoUser(userAttributes) {
  const { owner } = getContext();

  const { username } = userAttributes;
  const cognito = owner.lookup('service:cognito');
  const { poolId, clientId } = getProperties(cognito, "poolId", "clientId");
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

export function mockAuth(auth) {
  const { owner } = getContext();
  const cognito = owner.lookup('service:cognito');
  set(cognito, 'auth', auth || MockAuth.create());
}

// Re-export MockUser so everything can be in this new namespace
export { MockUser, MockAuth };
