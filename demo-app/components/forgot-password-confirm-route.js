import Component from '@ember/component';
import { service } from '@ember/service';
import { action, set } from '@ember/object';

export default class ForgotPasswordConfirmRoute extends Component {
  @service cognito;

  @action
  updateUsername(event) {
    set(this, 'username', event.target.value);
  }

  @action
  updateCode(event) {
    set(this, 'code', event.target.value);
  }

  @action
  updatePassword(event) {
    set(this, 'password', event.target.value);
  }

  @action
  async forgotPasswordSubmit(e) {
    const { username, code, password } = this;

    e.preventDefault();

    try {
      await this.cognito.forgotPasswordSubmit(username, code, password);
      this.onComplete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
