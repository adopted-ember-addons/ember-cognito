import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

export default class ForgotPasswordConfirmRoute extends Component {
  @service cognito;

  @tracked code;
  @tracked errorMessage;
  @tracked password;
  @tracked username;

  @action
  updateUsername(event) {
    this.username = event.target.value;
  }

  @action
  updateCode(event) {
    this.code = event.target.value;
  }

  @action
  updatePassword(event) {
    this.password = event.target.value;
  }

  @action
  async forgotPasswordSubmit(e) {
    const { username, code, password } = this;

    e.preventDefault();

    try {
      await this.cognito.forgotPasswordSubmit(username, code, password);
      this.args.onComplete();
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>Reset Password</h1>
          <form
            class="reset-password-form"
            {{on "submit" this.forgotPasswordSubmit}}
          >
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <div class="form-group">
              <label for="username">Username</label>
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
              <label for="code">Code</label>
              <input
                value={{this.code}}
                {{on "input" this.updateCode}}
                class="form-control"
                id="code"
                placeholder="123456"
                required
              />
            </div>
            <div class="form-group">
              <label for="password">New Password</label>
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
            <button type="submit" class="btn btn-primary">Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  </template>
}
