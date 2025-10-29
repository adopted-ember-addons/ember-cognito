/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service cognito;
  @service currentUser;
  @service session;
  @alias('cognito.poolId') poolId;
  @alias('cognito.clientId') clientId;

  constructor() {
    super(...arguments);
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
  }

  @action
  setPoolId(e) {
    set(this, 'poolId', e.target.value);
  }

  @action
  setClientId(e) {
    set(this, 'clientId', e.target.value);
  }

  @action
  saveIds(e) {
    e.preventDefault();
    localStorage.setItem('ember-cognito/dummy/poolId', this.poolId);
    localStorage.setItem('ember-cognito/dummy/clientId', this.clientId);
  }

  @action
  logout() {
    this.session.invalidate();
  }
}
