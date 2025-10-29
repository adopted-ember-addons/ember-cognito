
import { set } from '@ember/object';
import { MockUser } from '../utils/ember-cognito.js';

/* global wait */
function mockCognitoUser(app, userAttributes) {
  const {
    __container__: container
  } = app;
  const cognito = container.lookup('service:cognito');
  set(cognito, 'user', MockUser.create(userAttributes));
  return wait();
}
function unmockCognitoUser(app) {
  const {
    __container__: container
  } = app;
  const cognito = container.lookup('service:cognito');
  set(cognito, 'user', undefined);
  return wait();
}
function getAuthenticator(app) {
  return app.__container__.lookup('authenticator:cognito');
}

export { getAuthenticator, mockCognitoUser, unmockCognitoUser };
//# sourceMappingURL=ember-cognito.js.map
