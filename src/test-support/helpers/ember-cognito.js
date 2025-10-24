/* global wait */
import { MockUser } from '../utils/ember-cognito.js';
import { set } from '@ember/object';

export function mockCognitoUser(app, userAttributes) {
  const { __container__: container } = app;
  const cognito = container.lookup('service:cognito');
  set(cognito, 'user', MockUser.create(userAttributes));
  return wait();
}

export function unmockCognitoUser(app) {
  const { __container__: container } = app;
  const cognito = container.lookup('service:cognito');
  set(cognito, 'user', undefined);
  return wait();
}

export function getAuthenticator(app) {
  return app.__container__.lookup('authenticator:cognito');
}
