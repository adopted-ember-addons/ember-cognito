
import { getContext } from '@ember/test-helpers';
import { set } from '@ember/object';
import { typeOf } from '@ember/utils';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import MockAuth from './utils/-mock-auth.js';
export { makeToken, newSession } from './utils/-mock-auth.js';
import { MockUser } from './utils/ember-cognito.js';

function newUser(username) {
  const {
    owner
  } = getContext();
  const cognito = owner.lookup('service:cognito');
  const {
    poolId = 'us-east-1_TEST',
    clientId = 'TEST'
  } = cognito;
  const pool = new CognitoUserPool({
    UserPoolId: poolId,
    ClientId: clientId
  });
  return new CognitoUser({
    Username: username,
    Pool: pool
  });
}
function mockCognitoUser(userAttributes) {
  const {
    owner
  } = getContext();
  const {
    username
  } = userAttributes;
  const cognito = owner.lookup('service:cognito');
  const {
    poolId = 'us-east-1_TEST',
    clientId = 'TEST'
  } = cognito;
  const pool = new CognitoUserPool({
    UserPoolId: poolId,
    ClientId: clientId
  });
  const user = new CognitoUser({
    Username: username,
    Pool: pool
  });
  const auth = MockAuth.create({
    _authenticatedUser: user
  });
  set(cognito, 'auth', auth);
  set(cognito, 'user', MockUser.create(userAttributes));
}
function unmockCognitoUser() {
  const {
    owner
  } = getContext();
  const cognito = owner.lookup('service:cognito');
  set(cognito, 'user', undefined);
}
function mockAuth(authClassOrInstance = MockAuth) {
  const {
    owner
  } = getContext();
  const cognito = owner.lookup('service:cognito');
  const auth = typeOf(authClassOrInstance) === 'class' ? authClassOrInstance.create() : authClassOrInstance;
  set(cognito, 'auth', auth);
}

export { MockAuth, MockUser, mockAuth, mockCognitoUser, newUser, unmockCognitoUser };
//# sourceMappingURL=index.js.map
