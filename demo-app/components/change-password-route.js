import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class ChangePasswordRoute extends Component {
  @service cognito;

  @action
  async changePassword(e) {
    const { oldPassword, newPassword } = this;

    e.preventDefault();

    try {
      await this.cognito.user.changePassword(oldPassword, newPassword);
      this.onComplete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
