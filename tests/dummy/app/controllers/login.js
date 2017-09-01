import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, getProperties, get } from '@ember/object';

export default Controller.extend({
  session: service(),
  newPasswordRequired: equal('state.name', 'newPasswordRequired'),

  actions: {
    login(e) {
      e.preventDefault();
      let params = getProperties(this, 'username', 'password');
      this.authenticate(params);
    },

    newPassword(e) {
      e.preventDefault();
      let { newPassword, state } = getProperties(this, 'newPassword', 'state');
      this.authenticate({ password: newPassword, state });
    }
  },

  authenticate(params) {
    get(this, 'session').authenticate('authenticator:cognito', params).then(() => {
      // Nothing to do.
    }).catch((err) => {
      if (err.state && err.state.name === 'newPasswordRequired') {
        set(this, 'errorMessage', '');
        set(this, 'state', err.state);
      } else {
        set(this, 'errorMessage', err.message || err);
      }
    });
  }
});
