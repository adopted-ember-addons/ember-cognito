import Component from '@ember/component';
import layout from '../templates/components/register-index-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),

  actions: {
    register(e) {
      const { username, password, phone, email } = this;
      const attributes = {
        email,
        phone_number: phone
      };

      e.preventDefault();
      this.cognito.signUp(username, password, attributes).then((result) => {
        // If the user is confirmed, take then right to the
        if (result.userConfirmed) {
          this.onComplete(result.user);
        } else {
          this.onConfirmationRequired(result.user);
        }
      }).catch((err) => {
        this.set('errorMessage', err.message);
      });
    }
  }
});
