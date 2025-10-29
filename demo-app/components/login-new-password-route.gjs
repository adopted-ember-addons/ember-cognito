import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

export default class LoginNewPasswordRoute extends Component {
  @service cognito;
  @service session;

  @tracked errorMessage;
  @tracked password;

  @action
  updatePassword(event) {
    this.password = event.target.value;
  }

  @action
  async newPassword(e) {
    e.preventDefault();
    try {
      await this.session.authenticate('authenticator:cognito', {
        password: this.password,
        state: this.args.model,
      });
    } catch (err) {
      // TODO: Handle another state, like TOTP
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>Set New Password</h1>
          <form class="login-form" {{on "submit" this.newPassword}}>
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <p>Please enter a new password.</p>
            <div class="form-group">
              <label for="password">Password</label>
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
            <button type="submit" class="btn btn-primary">Set password</button>
          </form>
        </div>
      </div>
    </div>
  </template>
}
