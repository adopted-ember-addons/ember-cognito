import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service cognito;
  @service session;

  get cognitoUser() {
    return this.cognito.user;
  }

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
