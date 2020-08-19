import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  cognito: service(),
  currentUser: service(),
  session: service(),
  poolId: alias('cognito.poolId'),
  clientId: alias('cognito.clientId'),

  init() {
    this._super(...arguments);
    let poolId = localStorage.getItem('ember-cognito/dummy/poolId');
    let clientId = localStorage.getItem('ember-cognito/dummy/clientId');
    // Ignore the defaults, which are used to test the configuration in unit tests
    // but don't work for the dummy app.
    if (poolId === 'us-east-1_TEST' && clientId === 'TEST') {
      poolId = '';
      clientId = '';
    }
    set(this, 'poolId', poolId);
    set(this, 'clientId', clientId);
  },

  actions: {
    saveIds(e) {
      e.preventDefault();
      localStorage.setItem('ember-cognito/dummy/poolId', this.poolId);
      localStorage.setItem('ember-cognito/dummy/clientId', this.clientId);
    },

    logout() {
      this.session.invalidate();
    }
  }
});
