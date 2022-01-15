import Component from '@ember/component';
import layout from '../templates/components/index-auth';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

function attributeEqual(attributeName, value) {
  return computed('model.attributes', function () {
    const attributes = this.model.attributes;
    for (const attr of attributes) {
      if (attr.name === attributeName) {
        return attr.value === value;
      }
    }
    // Maybe? It doesn't *need* to be verified
    return true;
  });
}

export default class IndexAuth extends Component {
  layout = layout;
  @service currentUser;
  @service cognito;
  @service router;
  @service session;
  @readOnly('cognito.user') cognitoUser;

  @attributeEqual('email_verified', 'true') emailVerified;
  @attributeEqual('phone_number_verified', 'true') phoneNumberVerified;

  constructor() {
    super(...arguments);
    this.getSession();
  }

  async getSession() {
    // Fetch the cognito session
    let cognitoUser = this.cognitoUser;
    if (cognitoUser) {
      const session = await cognitoUser.getSession();
      // It can happen in acceptance tests that 'session' is falsey
      if (session) {
        this.set('cognitoSession', session);
      }
    }
  }

  tokenInfo(token) {
    return {
      expiration: new Date(token.getExpiration() * 1000),
      formatted: JSON.stringify(token.payload, undefined, 2),
    };
  }

  @computed('cognitoSession')
  get accessToken() {
    let session = this.cognitoSession;
    if (session) {
      return this.tokenInfo(session.getAccessToken());
    }
    return undefined;
  }

  @computed('cognitoSession')
  get idToken() {
    let session = this.cognitoSession;
    if (session) {
      return this.tokenInfo(session.getIdToken());
    }
    return undefined;
  }

  @computed('session.data')
  get authenticatedData() {
    return JSON.stringify(this.session.data, undefined, 2);
  }

  @action
  async verifyAttribute(attributeName) {
    await this.cognitoUser.getAttributeVerificationCode(attributeName);
    this.router.transitionTo('attribute-verify', {
      queryParams: { name: attributeName },
    });
  }
}
