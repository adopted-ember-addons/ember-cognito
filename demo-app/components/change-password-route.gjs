import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

export default class ChangePasswordRoute extends Component {
  @service cognito;

  @tracked errorMessage;
  @tracked oldPassword;
  @tracked newPassword;

  @action
  updateOldPassword(event) {
    this.oldPassword = event.target.value;
  }

  @action
  updateNewPassword(event) {
    this.newPassword = event.target.value;
  }

  @action
  async changePassword(e) {
    const { oldPassword, newPassword } = this;

    e.preventDefault();

    try {
      await this.cognito.user.changePassword(oldPassword, newPassword);
      this.args.onComplete();
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>Change Password</h1>
          <form
            class="change-password-form"
            {{on "submit" this.changePassword}}
          >
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <div class="form-group">
              <label for="username">Old Password</label>
              <input
                value={{this.oldPassword}}
                {{on "input" this.updateOldPassword}}
                type="password"
                class="form-control"
                id="username"
                autofocus
                required
              />
            </div>
            <div class="form-group">
              <label for="code">New Password</label>
              <input
                value={{this.newPassword}}
                {{on "input" this.updateNewPassword}}
                type="password"
                class="form-control"
                id="code"
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
