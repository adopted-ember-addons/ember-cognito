import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';

export default class LoginIndexRoute extends Component {
  @service cognito;
  @service session;

  @tracked password;
  @tracked username;

  @action
  updateUsername(event) {
    this.username = event.target.value;
  }

  @action
  updatePassword(event) {
    this.password = event.target.value;
  }

  @action
  async login(e) {
    e.preventDefault();
    let params = { username: this.username, password: this.password };
    try {
      await this.session.authenticate('authenticator:cognito', params);
    } catch (err) {
      if (err.state && err.state.name === 'newPasswordRequired') {
        set(this, 'cognito.state', err.state);
        this.args.onNewPasswordRequired();
      } else {
        set(this, 'errorMessage', err.message || err);
      }
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>
            Login
          </h1>
          <form class="login-form" {{on "submit" this.login}}>
            {{#if this.errorMessage}}
              <div class="alert alert-danger">
                {{this.errorMessage}}
              </div>
            {{/if}}
            <div class="form-group">
              <label for="username">
                Username
              </label>
              <input
                value={{this.username}}
                {{on "input" this.updateUsername}}
                class="form-control"
                id="username"
                placeholder="Username"
                autofocus
                required
              />
            </div>
            <div class="form-group">
              <label for="password">
                Password
              </label>
              <input
                value={{this.password}}
                {{on "input" this.updatePassword}}
                type="password"
                class="form-control"
                id="password"
                placeholder="Password"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary">
              Login
            </button>
            <LinkTo @route="forgot-password.index" class="btn btn-link">
              Forgot password
            </LinkTo>
          </form>
        </div>
      </div>
    </div>
  </template>
}
