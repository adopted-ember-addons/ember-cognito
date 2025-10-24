import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, set } from '@ember/object';

export default class AttributeRoute extends Component {
  @service cognito;

  @action
  async save(e) {
    e.preventDefault();
    const { name, value } = this.model;

    try {
      await this.cognito.user.updateAttributes({ [name]: value });
      this.onSave();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }

  @action
  async deleteAttr(e) {
    e.preventDefault();
    const { name } = this.model;

    try {
      await this.cognito.user.deleteAttributes([name]);
      this.onDelete();
    } catch (err) {
      set(this, 'errorMessage', err.message);
    }
  }
}
