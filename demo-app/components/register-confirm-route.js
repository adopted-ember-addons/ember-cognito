import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class RegisterConfirmRoute extends Component {
  @service cognito;

  @action
  async confirm(e) {
    const { username, code } = this;

    e.preventDefault();
    try {
      await this.cognito.confirmSignUp(username, code);
      this.onComplete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
