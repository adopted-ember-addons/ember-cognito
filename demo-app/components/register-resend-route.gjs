import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

export default class RegisterResendRoute extends Component {
  @service cognito;

  @tracked errorMessage;
  @tracked username;

  @action
  updateUsername(event) {
    this.username = event.target.value;
  }

  @action
  async resend(e) {
    const username = this.username;

    e.preventDefault();
    try {
      await this.cognito.resendSignUp(username);
      this.args.onComplete();
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>Resend registration code</h1>
          <form class="register-resend-form" {{on "submit" this.resend}}>
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
            <button type="submit" class="btn btn-primary">Resend</button>
          </form>
        </div>
      </div>
    </div>
  </template>
}
