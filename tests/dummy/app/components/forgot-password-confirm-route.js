import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class ForgotPasswordConfirmRoute extends Component {
  @service cognito;

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
