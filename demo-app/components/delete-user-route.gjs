import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action, set } from '@ember/object';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';

export default class DeleteUserRoute extends Component {
  @service cognito;
  @service session;

  @action
  updateDeleteVal(event) {
    set(this, 'deleteVal', event.target.value);
  }

  @action
  async deleteUser(e) {
    e.preventDefault();
    const deleteVal = this.deleteVal;
    if (deleteVal !== 'DELETE') {
      set(this, 'errorMessage', 'Type "DELETE"');
      return;
    }

    try {
      await this.cognito.user.deleteUser();
      await this.session.invalidate();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }

  <template>
    <div class="container">
      <div class="row">
        <div class="col-6">
          <h1>Delete user</h1>
          <p>Are you sure you want to delete this user? Type
            <strong>DELETE</strong>:</p>

          <form class="delete-user-form" {{on "submit" this.deleteUser}}>
            {{#if this.errorMessage}}
              <div class="alert alert-danger">{{this.errorMessage}}</div>
            {{/if}}
            <div class="form-group">
              <label for="delete">Delete</label>
              <input
                value={{this.deleteVal}}
                {{on "input" this.updateDeleteVal}}
                class="form-control"
                id="delete"
                autofocus
                required
              />
            </div>
            <button type="submit" class="btn btn-danger">Delete User</button>
            <LinkTo @route="index" class="btn btn-info ml-auto">Go back</LinkTo>
          </form>
        </div>
      </div>
    </div>
  </template>
}
