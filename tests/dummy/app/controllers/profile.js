import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service(),
  attributes: [
    'sub',
    'username',
    'email',
    'email_verified'
  ]
});
