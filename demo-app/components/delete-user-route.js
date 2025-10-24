import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

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
}
