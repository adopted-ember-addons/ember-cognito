import { readOnly } from '@ember/object/computed';
import Service, { inject as service } from '@ember/service';

export default class CurrentUserService extends Service {
  @service session;
  @service cognito;
  @readOnly('cognito.user') cognitoUser;
  @readOnly('cognitoUser.username') username;

  async load() {
    if (this.session.isAuthenticated) {
      const userAttributes = await this.cognitoUser.getUserAttributes();
      userAttributes.forEach((attr) => {
        this.set(attr.getName(), attr.getValue());
      });
    }
  }
}
