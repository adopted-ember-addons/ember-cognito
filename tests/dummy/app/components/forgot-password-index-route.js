import Component from '@ember/component';
import layout from '../templates/components/forgot-password-index-route';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class ForgotPasswordIndexRoute extends Component {
  layout = layout;

  @service cognito;

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
