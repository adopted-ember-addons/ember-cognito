import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

export default class AttributeVerifyRoute extends Component {
  @service cognito;

  @tracked errorMessage;
  @tracked code;

  @action
  updateCode(event) {
    this.code = event.target.value;
  }

  @action
  async verifyAttribute(e) {
    e.preventDefault();

    const { code } = this;

    try {
      await this.cognito.user.verifyAttribute(this.args.name, code);
      this.args.onComplete();
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          <h1>Verify {{@name}}</h1>
          <form
            class="verify-attribute-form"
            {{on "submit" this.verifyAttribute}}
          >
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <div class="form-group">
              <label for="code">Verification Code</label>
              <input
                value={{this.code}}
                {{on "input" this.updateCode}}
                class="form-control"
                id="code"
                placeholder="123456"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary">Verify</button>
          </form>
        </div>
      </div>
    </div>
  </template>
}
