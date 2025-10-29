import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';

export default class RegisterIndexRoute extends Component {
  @service cognito;

  @tracked email;
  @tracked errorMessage;
  @tracked password;
  @tracked phone;
  @tracked username;

  @action
  updateUsername(event) {
    this.username = event.target.value;
  }

  @action
  updateEmail(event) {
    this.email = event.target.value;
  }

  @action
  updatePhone(event) {
    this.phone = event.target.value;
  }

  @action
  updatePassword(event) {
    this.password = event.target.value;
  }

  @action
  async register(e) {
    const { username, password, phone, email } = this;
    const attributes = {
      email,
      phone_number: phone,
    };

    e.preventDefault();
    try {
      const result = await this.cognito.signUp(username, password, attributes);
      // If the user is confirmed, take then right to the index page
      if (result.userConfirmed) {
        this.args.onComplete(result.user);
      } else {
        this.args.onConfirmationRequired(result.user);
      }
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">

      <div class="row">
        <div class="col-4">
          <h1>Register</h1>
          <form class="register-form" {{on "submit" this.register}}>
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
              <label for="email_address">Email address</label>
              <input
                value={{this.email}}
                {{on "input" this.updateEmail}}
                type="email"
                class="form-control"
                id="email_address"
                placeholder="email@example.com"
              />
            </div>
            <div class="form-group">
              <label for="phone">Phone number</label>
              <input
                value={{this.phone}}
                {{on "input" this.updatePhone}}
                type="tel"
                class="form-control"
                id="phone"
                placeholder="+18885551212"
              />
            </div>
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
            <button type="submit" class="btn btn-primary">Register</button>
          </form>
        </div>
      </div>
    </div>
  </template>
}
