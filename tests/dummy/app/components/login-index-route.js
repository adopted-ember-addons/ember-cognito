import Component from '@ember/component';
import { action, set } from '@ember/object';
import layout from '../templates/components/login-index-route';
import { inject as service } from '@ember/service';

export default class LoginIndexRoute extends Component {
  layout = layout;

  @service cognito;
  @service session;

  @action
  async login(e) {
    e.preventDefault();
    let params = { username: this.username, password: this.password };
    try {
      await this.session.authenticate('authenticator:cognito', params);
    } catch (err) {
      if (err.state && err.state.name === 'newPasswordRequired') {
        set(this, 'cognito.state', err.state);
        this.onNewPasswordRequired();
      } else {
        set(this, 'errorMessage', err.message || err);
      }
    }
  }
}
