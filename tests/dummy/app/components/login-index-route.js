import Component from '@ember/component';
import layout from '../templates/components/login-index-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),
  session: service(),

  actions: {
    login(e) {
      e.preventDefault();
      let params = { username: this.username, password: this.password };
      this.session.authenticate('authenticator:cognito', params).then(() => {
        // Nothing to do.
      }).catch((err) => {
        if (err.state && err.state.name === 'newPasswordRequired') {
          this.set('cognito.state', err.state);
          this.onNewPasswordRequired();
        } else {
          this.set('errorMessage', err.message || err);
        }
      });
    },
  }
});
