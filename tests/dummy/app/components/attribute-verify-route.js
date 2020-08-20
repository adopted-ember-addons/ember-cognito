import Component from '@ember/component';
import layout from '../templates/components/attribute-verify-route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AttributeVerifyRoute extends Component {
  layout = layout;

  @service cognito;

  @action
  async verifyAttribute(e) {
    e.preventDefault();

    const { name, code } = this;

    try {
      await this.cognito.user.verifyAttribute(name, code);
      this.onComplete();
    } catch (err) {
      this.set('errorMessage', err.message);
    }
  }
}
