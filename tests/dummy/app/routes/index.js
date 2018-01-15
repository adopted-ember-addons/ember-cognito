import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { readOnly } from '@ember/object/computed';

export default Route.extend({
  cognito: service(),
  cognitoUser: readOnly('cognito.user'),
  session: service(),

  model() {
    if (this.get('session.isAuthenticated')) {
      return this.get('cognitoUser').getUserAttributes().then((cognitoAttrs) => {
        let attributes = [];
        cognitoAttrs.forEach((attr) => {
          attributes.push({ name: attr.getName(), value: attr.getValue() });
        });
        return { attributes };
      });
    }
  }
});
