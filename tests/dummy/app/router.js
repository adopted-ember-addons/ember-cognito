import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('change-password');
  this.route('delete-user');
  this.route('forgot-password', function() {
    this.route('confirm');
  });
  this.route('login', function() {
    this.route('new-password');
  });
  this.route('profile');
  this.route('register', function() {
    this.route('confirm');
    this.route('resend');
  });
});

export default Router;
