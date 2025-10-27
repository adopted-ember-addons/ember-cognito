import { setApplication } from '@ember/test-helpers';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import setupSinon from 'ember-sinon-qunit';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import EmberRouter from '@ember/routing/router';
import loadInitializers from 'ember-load-initializers';
import EmberApp from 'ember-strict-application-resolver';
import compatModules from '@embroider/virtual/compat-modules';
import { compatToRFC1132 } from '../demo-app/app.gts';
import emberCognitoRegistry from '../src/registry.ts';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

class TestApp extends EmberApp {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    ...import.meta.glob('../demo-app/**/*.{js,ts,gjs,gts}', { eager: true }),

    ...compatToRFC1132('test-app', compatModules),
    ...emberCognitoRegistry(),
  };
}

loadInitializers(TestApp, 'test-app', compatModules);

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
