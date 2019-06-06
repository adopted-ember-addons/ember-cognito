import Component from '@ember/component';
import layout from '../templates/components/login-new-password-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),
  session: service(),

  actions: {
    newPassword(e) {
      e.preventDefault();
      this.get('session').authenticate('authenticator:cognito', {
        password: this.get('password'),
        state: this.get('model')
      }).then(() => {
        // Nothing to do.
      }).catch((err) => {
        // TODO: Handle another state, like TOTP
        this.set('errorMessage', err.message || err);
      });
    },
  }
});
