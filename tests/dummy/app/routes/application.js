import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Ember from 'ember';

const {
  inject: { service },
  Route
} = Ember;

export default Route.extend(ApplicationRouteMixin, {
  currentUser: service(),

  beforeModel() {
    return this._loadCurrentUser();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadCurrentUser();
  },

  _loadCurrentUser() {
    return this.get('currentUser').load().catch(() => this.get('session').invalidate());
  }
});
