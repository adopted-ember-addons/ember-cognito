import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

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
