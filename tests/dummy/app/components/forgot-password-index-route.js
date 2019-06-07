import Component from '@ember/component';
import layout from '../templates/components/forgot-password-index-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),

  actions: {
    forgotPassword(e) {
      const username = this.get('username');
      e.preventDefault();

      this.get('cognito').forgotPassword(username).then(() => {
        this.onComplete();
      }).catch((err) => {
        this.set('errorMessage', err.message);
      });
    }
  }
});
