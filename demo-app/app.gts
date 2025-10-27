import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';
import PageTitleService from 'ember-page-title/services/page-title';
import loadInitializers from 'ember-load-initializers';
import emberCognitoRegistry from '../src/registry.ts';
import compatModules from '@embroider/virtual/compat-modules';

import { assert } from '@ember/debug';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compatToRFC1132(modulePrefix: string, modules: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = {};

  let madeReplacements = false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const [key, module] of Object.entries(modules)) {
    const newKey = key.replace(new RegExp(`^${modulePrefix}/`), './');

    if (!madeReplacements) {
      if (key !== newKey) {
        madeReplacements = true;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    result[newKey] = module;
  }

  assert(
    `No replacements were made. Is the ${modulePrefix} correct? These candidates exist: ${[
      ...new Set<string>(
        /**
         * 'full-name/foo' => 'full-name'
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        Object.keys(modules).map(
          (full) => full.split('/')[0] ?? '<could not detect>',
        ),
      ).values(),
    ].join(', ')}`,
    madeReplacements,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}

class Router extends EmberRouter {
  location = 'history';
  rootURL = '/';
}

export class App extends EmberApp {
  /**
   * Any services or anything from the addon that needs to be in the app-tree registry
   * will need to be manually specified here.
   *
   * Techniques to avoid needing this:
   * - private services
   * - require the consuming app import and configure themselves
   *   (which is what we're emulating here)
   */
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
    './router': Router,
    './services/page-title': PageTitleService,
    ...import.meta.glob('./components/**/*.{gjs,gts}', { eager: true }),
    ...import.meta.glob('./controllers/**/*.{js,ts}', { eager: true }),
    ...import.meta.glob('./routes/**/*.{js,ts}', { eager: true }),
    /**
     * NOTE: this glob will import everything matching the glob,
     *     and includes non-services in the services directory.
     */
    ...import.meta.glob('./services/**/*.{js,ts}', { eager: true }),
    /**
     * These imports are not magic, but we do require that all entries in the
     * modules object match a ./[type]/[name] pattern.
     *
     * See: https://rfcs.emberjs.com/id/1132-default-strict-resolver
     */
    ...import.meta.glob('./templates/**/*.{gjs,gts}', { eager: true }),
    ...compatToRFC1132('demo-app', compatModules),
    ...emberCognitoRegistry(),
  };
}

loadInitializers(App, 'demo-app', compatModules);

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
