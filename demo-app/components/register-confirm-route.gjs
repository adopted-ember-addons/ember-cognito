import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import Input from '@ember/component/input';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';

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

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>Confirm Registration</h1>
          <form class="register-confirm-form" {{on "submit" this.confirm}}>
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <div class="form-group">
              <label for="username">Username</label>
              <Input
                @value={{this.username}}
                class="form-control"
                id="username"
                placeholder="Username"
                autofocus
                required
              />
            </div>
            <div class="form-group">
              <label for="code">Code</label>
              <Input
                @value={{this.code}}
                class="form-control"
                id="code"
                placeholder="123456"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary">Confirm</button>
            <LinkTo @route="register.resend" class="btn btn-link">Resend
              confirmation code</LinkTo>
          </form>
        </div>
      </div>
    </div>
  </template>
}
