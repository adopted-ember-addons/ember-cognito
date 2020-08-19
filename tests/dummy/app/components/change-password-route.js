import Component from '@ember/component';
import layout from '../templates/components/change-password-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ChangePasswordRoute extends Component {
  layout = layout;

  @service cognito;

  @action
  async changePassword(e) {
    const { oldPassword, newPassword, } = this;

    e.preventDefault();

    try {
      await this.cognito.user.changePassword(oldPassword, newPassword);
      this.onComplete();
    } catch (err) {
      this.set('errorMessage', err.message);
    }
  }
}
