import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('login', function() {
    this.route('new-password');
  });
  this.route('profile');
  this.route('register', function() {
    this.route('confirm');
  });
});

export default Router;
