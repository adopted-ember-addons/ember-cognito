import Ember from 'ember';

const {
  Controller,
  inject: { service }
} = Ember;

export default Controller.extend({
  currentUser: service(),
  session: service(),

  actions: {
    logout() {
      this.get('session').invalidate();
    }
  }
});
