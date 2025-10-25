import EmberApp from 'ember-strict-application-resolver';
import EmberRouter from '@ember/routing/router';
import PageTitleService from 'ember-page-title/services/page-title';
import loadInitializers from 'ember-load-initializers';
import emberCognitoRegistry from '../src/registry.ts';
import emberSimpleAuth from 'ember-simple-auth/initializers/ember-simple-auth';
import setupSession from 'ember-simple-auth/initializers/setup-session';

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
  modules = {
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
    ...emberCognitoRegistry(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
loadInitializers(App, 'demo-app', {
  'ember-simple-auth/initializers/ember-simple-auth': emberSimpleAuth,
  'ember-simple-auth/initializers/setup-session': setupSession,
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
