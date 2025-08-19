import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class RegisterResendRoute extends Component {
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
