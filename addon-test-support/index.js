import { getContext } from '@ember/test-helpers';
import { set } from '@ember/object';
import { MockUser } from './utils/ember-cognito';

export function mockCognitoUser(userAttributes) {
  const { owner } = getContext();
  const cognito = owner.lookup('service:cognito');
  set(cognito, 'user', MockUser.create(userAttributes));
}

export function unmockCognitoUser() {
  const { owner } = getContext();
  const cognito = owner.lookup('service:cognito');
  set(cognito, 'user', undefined);
}

// Re-export MockUser so everything can be in this new namespace
export { MockUser };
