import Component from '@ember/component';
import layout from '../templates/components/register-resend-route';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class RegisterResendRoute extends Component {
  layout = layout;

  @service cognito;

  @action
  async resend(e) {
    const username = this.username;

    e.preventDefault();
    try {
      await this.cognito.resendSignUp(username);
      this.onComplete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
