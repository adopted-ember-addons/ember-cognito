import Component from '@ember/component';
import layout from '../templates/components/register-resend-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),

  actions: {
    confirm(e) {
      const username = this.username;

      e.preventDefault();
      this.cognito.resendSignUp(username).then(() => {
        this.onComplete();
      }).catch((err) => {
        this.set('errorMessage', err.message);
      });
    }
  }
});
