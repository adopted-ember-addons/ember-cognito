import Component from '@ember/component';
import layout from '../templates/components/delete-user-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class DeleteUserRoute extends Component {
  layout = layout;

  @service cognito;
  @service session;

  @action
  async deleteUser(e) {
    e.preventDefault();
    const deleteVal = this.deleteVal;
    if (deleteVal !== 'DELETE') {
      this.set('errorMessage', 'Type "DELETE"');
      return;
    }

    try {
      await this.cognito.user.deleteUser();
      await this.session.invalidate();
    } catch (err) {
      this.set('errorMessage', err.message);
    }
  }
}
