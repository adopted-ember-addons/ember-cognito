import Ember from 'ember';

const {
  Controller,
  inject: { service }
} = Ember;

export default Controller.extend({
  session: service(),

  actions: {
    login(e) {
      e.preventDefault();
      let params = this.getProperties('username', 'password');
      this.get('session').authenticate('authenticator:cognito', params).then(() => {
        // Nothing to do.
      }).catch((err) => {
        if (err.state && err.state.name === 'newPasswordRequired') {
          this.set('authState', err.state);
          this.set('newPasswordRequired', true);
        } else {
          this.set('errorMessage', err.message);
        }
      });
    }
  }
});
