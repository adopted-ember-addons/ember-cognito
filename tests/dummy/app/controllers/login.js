import Ember from 'ember';

const {
  computed: { equal },
  Controller,
  inject: { service }
} = Ember;

export default Controller.extend({
  session: service(),
  newPasswordRequired: equal('state.name', 'newPasswordRequired'),

  authenticate(params) {
    this.get('session').authenticate('authenticator:cognito', params).then(() => {
      // Nothing to do.
    }).catch((err) => {
      if (err.state && err.state.name === 'newPasswordRequired') {
        this.set('errorMessage', '');
        this.set('state', err.state);
      } else {
        this.set('errorMessage', err.message || err);
      }
    });
  },

  actions: {
    login(e) {
      e.preventDefault();
      let params = this.getProperties('username', 'password');
      this.authenticate(params);
    },

    newPassword(e) {
      e.preventDefault();
      let { newPassword, state } = this.getProperties('newPassword', 'state');
      this.authenticate({ password: newPassword, state });
    }
  }
});
