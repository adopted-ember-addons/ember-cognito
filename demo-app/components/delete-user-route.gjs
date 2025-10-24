import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';
import Input from '@ember/component/input';
import { on } from '@ember/modifier';

export default class DeleteUserRoute extends Component {
  @service cognito;
  @service session;

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
              <Input
                @value={{this.deleteVal}}
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
