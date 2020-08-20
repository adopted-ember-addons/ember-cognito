import Component from '@ember/component';
import layout from '../templates/components/register-confirm-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class RegisterConfirmRoute extends Component {
  layout = layout;

  @service cognito;

  @action
  async confirm(e) {
    const { username, code } = this;

    e.preventDefault();
    try {
      await this.cognito.confirmSignUp(username, code);
      this.onComplete();
    } catch (err) {
      this.set('errorMessage', err.message);
    }
  }
}

