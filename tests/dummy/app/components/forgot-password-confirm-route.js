import Component from '@ember/component';
import layout from '../templates/components/forgot-password-confirm-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ForgotPasswordConfirmRoute extends Component {
  layout = layout;

  @service cognito;

  @action
  async forgotPasswordSubmit(e) {
    const { username, code, password } = this;

    e.preventDefault();

    try {
      await this.cognito.forgotPasswordSubmit(username, code, password);
      this.onComplete();
    } catch (err) {
      this.set('errorMessage', err.message);
    }
  }
}
