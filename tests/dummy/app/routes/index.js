import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { readOnly } from '@ember/object/computed';

export default class IndexRoute extends Route {
  @service cognito;
  @service session;
  @readOnly('cognito.user') cognitoUser;

  async model() {
    if (this.session.isAuthenticated) {
      const cognitoAttrs = await this.cognitoUser.getUserAttributes();
      let attributes = [];
      cognitoAttrs.forEach((attr) => {
        attributes.push({ name: attr.getName(), value: attr.getValue() });
      });
      return { attributes };
    }
  }
}
