import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';

export default class AttributeRoute extends Component {
  @service cognito;

  @tracked errorMessage;

  @action
  updateName(event) {
    this.args.model.name = event.target.value;
  }

  @action
  updateValue(event) {
    this.args.model.value = event.target.value;
  }

  @action
  async save(e) {
    e.preventDefault();
    const { name, value } = this.args.model;

    try {
      await this.cognito.user.updateAttributes({ [name]: value });
      this.args.onSave();
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  @action
  async deleteAttr(e) {
    e.preventDefault();
    const { name } = this.args.model;

    try {
      await this.cognito.user.deleteAttributes([name]);
      this.args.onDelete();
    } catch (err) {
      this.errorMessage = err.message;
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-4">
          {{#if @model.isNew}}
            <h1>Add Attribute</h1>
          {{else}}
            <h1>Edit Attribute</h1>
          {{/if}}

          <form class="attribute-form" {{on "submit" this.save}}>
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <div class="form-group">
              <label for="name">Name</label>
              <input
                value={{@model.name}}
                {{on "input" this.updateName}}
                class="form-control"
                id="name"
                autofocus
                required
              />
            </div>
            <div class="form-group">
              <label for="value">Value</label>
              <input
                value={{@model.value}}
                {{on "input" this.updateValue}}
                class="form-control"
                id="value"
                required
              />
            </div>
            <button type="submit" class="btn btn-primary">Save</button>
            <button
              class="btn btn-danger"
              {{on "click" this.deleteAttr}}
              type="button"
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  </template>
}
