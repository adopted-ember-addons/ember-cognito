import { set } from '@ember/object';
import Service, { inject as service } from '@ember/service';

export default class CurrentUserService extends Service {
  @service cognito;
  @service session;

  get cognitoUser() {
    return this.cognito.user;
  }

  get username() {
    return this.cognitoUser?.username;
  }

  async load() {
    if (this.session.isAuthenticated) {
      const userAttributes = await this.cognitoUser.getUserAttributes();
      userAttributes.forEach((attr) => {
        set(this, attr.getName(), attr.getValue());
      });
    }
  }
}
