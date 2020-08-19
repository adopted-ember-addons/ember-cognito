import Component from '@ember/component';
import layout from '../templates/components/attribute-verify-route';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,

  cognito: service(),

  actions: {
    verifyAttribute(e) {
      e.preventDefault();

      const { name, code } = this;

      this.cognito.user.verifyAttribute(name, code).then(() => {
        this.onComplete();
      }).catch((err) => {
        this.set('errorMessage', err.message);
      });
    }
  }
});
