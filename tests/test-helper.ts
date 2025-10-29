import { setApplication } from '@ember/test-helpers';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import setupSinon from 'ember-sinon-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import EmberRouter from '@ember/routing/router';
import loadInitializers from 'ember-load-initializers';
import emberSimpleAuthInitializer from 'ember-simple-auth/initializers/ember-simple-auth';
import EmberApp from 'ember-strict-application-resolver';
import emberCognitoRegistry from '../src/registry.ts';

function transformModuleKeys(moduleObject: object) {
  return Object.fromEntries(
    Object.entries(moduleObject).map(([key, value]) => [
      key.replace(/^\.\.\/demo-app\//, './'),
      value,
    ]),
  );
}

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

const demoAppModules = transformModuleKeys(
  import.meta.glob('../demo-app/**/*.{js,ts,gjs,gts}', {
    eager: true,
  }),
);

class TestApp extends EmberApp {
  modules = {
    './config/environment': {
      cognito: {
        poolId: 'us-east-1_TEST',
        clientId: 'TEST',
        autoRefreshSession: true,
        authenticationFlowType: 'USER_SRP_AUTH',
      },
      'ember-simple-auth': {},
    },
    './router': { default: Router },
    ...demoAppModules,
    ...emberCognitoRegistry(),
  };
}

loadInitializers(TestApp, 'test-app', {
  'test-app/initializers/ember-simple-auth': {
    default: emberSimpleAuthInitializer,
  },
});

Router.map(function () {
  this.route('attribute');
  this.route('attribute-verify');
  this.route('change-password');
  this.route('delete-user');
  this.route('forgot-password', function () {
    this.route('confirm');
  });
  this.route('login', function () {
    this.route('new-password');
  });
  this.route('profile');
  this.route('register', function () {
    this.route('confirm');
    this.route('resend');
  });
});

export function start() {
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  );
  setupSinon();
  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  qunitStart();
}
