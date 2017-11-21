import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set } from '@ember/object';

export default Controller.extend({
  currentUser: service(),
  init() {
    this._super(...arguments);
    set(this, 'attributes', [
      'sub',
      'username',
      'email',
      'email_verified'
    ]);
  }
});
