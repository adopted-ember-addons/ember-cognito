import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AttributeRoute extends Route {
  @service cognito;

  async model({ name }) {
    if (name) {
      const attrs = await this.cognito.user.getUserAttributesHash();
      const value = attrs[name];
      return { name, value };
    }
    return { isNew: true };
  }
}
