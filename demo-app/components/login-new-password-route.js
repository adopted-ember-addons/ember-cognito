import Component from '@ember/component';
import { action, set } from '@ember/object';
import { service } from '@ember/service';

export default class LoginNewPasswordRoute extends Component {
  @service cognito;
  @service session;

  @action
  updatePassword(event) {
    set(this, 'password', event.target.value);
  }

  @action
  async newPassword(e) {
    e.preventDefault();
    try {
      await this.session.authenticate('authenticator:cognito', {
        password: this.password,
        state: this.model,
      });
    } catch (err) {
      // TODO: Handle another state, like TOTP
      set(this, 'errorMessage', err.message);
    }
  }
}
