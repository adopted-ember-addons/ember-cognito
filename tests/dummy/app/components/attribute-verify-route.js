import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class AttributeVerifyRoute extends Component {
  @service cognito;

  @action
  async verifyAttribute(e) {
    e.preventDefault();

    const { name, code } = this;

    try {
      await this.cognito.user.verifyAttribute(name, code);
      this.onComplete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
