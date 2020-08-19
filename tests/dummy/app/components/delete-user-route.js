import Component from '@ember/component';
import layout from '../templates/components/delete-user-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),
  session: service(),

  actions: {
    deleteUser(e) {
      e.preventDefault();
      const deleteVal = this.deleteVal;
      if (deleteVal !== 'DELETE') {
        this.set('errorMessage', 'Type "DELETE"');
        return;
      }

      this.cognito.user.deleteUser().then(() => {
        return this.session.invalidate();
      }).catch((err) => {
        this.set('errorMessage', err.message);
      });
    }
  }
});
