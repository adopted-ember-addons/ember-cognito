import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class RegisterIndexRoute extends Component {
  @service cognito;

  @action
  async register(e) {
    const { username, password, phone, email } = this;
    const attributes = {
      email,
      phone_number: phone,
    };

    e.preventDefault();
    try {
      const result = await this.cognito.signUp(username, password, attributes);
      // If the user is confirmed, take then right to the index page
      if (result.userConfirmed) {
        this.onComplete(result.user);
      } else {
        this.onConfirmationRequired(result.user);
      }
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
