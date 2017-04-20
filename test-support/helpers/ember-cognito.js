/* global wait */
import { MockUser } from '../utils/ember-cognito';

export function mockCognitoUser(app, userAttributes) {
  const { __container__: container } = app;
  const cognito = container.lookup('service:cognito');
  cognito.set('user', MockUser.create(userAttributes));
  return wait();
}

export function unmockCognitoUser(app) {
  const { __container__: container } = app;
  const cognito = container.lookup('service:cognito');
  cognito.set('user', undefined);
  return wait();
}
