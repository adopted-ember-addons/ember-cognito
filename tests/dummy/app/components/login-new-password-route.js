import Component from '@ember/component';
import layout from '../templates/components/login-new-password-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LoginNewPasswordRoute extends Component {
  layout = layout;

  @service cognito;
  @service session;

  @action
  async newPassword(e) {
    e.preventDefault();
    try {
      await this.session.authenticate('authenticator:cognito', {
        password: this.password,
        state: this.model
      });
    } catch (err) {
      // TODO: Handle another state, like TOTP
      this.set('errorMessage', err.message);
    }
  }
}
