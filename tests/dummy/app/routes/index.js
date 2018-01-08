import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { readOnly } from '@ember/object/computed';

export default Route.extend({
  cognito: service(),
  cognitoUser: readOnly('cognito.user'),
  session: service(),

  async model() {
    if (this.get('session.isAuthenticated')) {
      let cognitoAttrs = await this.get('cognitoUser').getUserAttributes();
      let attributes = [];
      cognitoAttrs.forEach((attr) => {
        attributes.push({ name: attr.getName(), value: attr.getValue() });
      });
      return { attributes };
    }
  }
});
