/* global wait */
import { MockUser } from '../utils/ember-cognito';
import Ember from 'ember';

const { set } = Ember;

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
