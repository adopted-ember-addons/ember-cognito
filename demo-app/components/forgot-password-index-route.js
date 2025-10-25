import Component from '@ember/component';
import { service } from '@ember/service';
import { action, set } from '@ember/object';

export default class ForgotPasswordIndexRoute extends Component {
  @service cognito;

  @action
  updateUsername(event) {
    set(this, 'username', event.target.value);
  }

  @action
  async forgotPassword(e) {
    const username = this.username;
    e.preventDefault();

    try {
      await this.cognito.forgotPassword(username);
      this.onComplete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
