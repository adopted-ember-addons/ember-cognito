import Component from '@glimmer/component';
import { service } from '@ember/service';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';
import { fn, hash } from '@ember/helper';

function attributeEqual(attributeName, value) {
  return computed('args.model.attributes', function () {
    const attributes = this.args.model?.attributes ?? [];
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
  @service currentUser;
  @service cognito;
  @service router;
  @service session;

  @tracked cognitoSession;

  get cognitoUser() {
    return this.cognito.user;
  }

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
        this.cognitoSession = session;
      }
    }
  }

  tokenInfo(token) {
    return {
      expiration: new Date(token.getExpiration() * 1000),
      formatted: JSON.stringify(token.payload, undefined, 2),
    };
  }

  get accessToken() {
    let session = this.cognitoSession;
    if (session) {
      return this.tokenInfo(session.getAccessToken());
    }
    return undefined;
  }

  get idToken() {
    let session = this.cognitoSession;
    if (session) {
      return this.tokenInfo(session.getIdToken());
    }
    return undefined;
  }

  get authenticatedData() {
    return JSON.stringify(this.session?.data, undefined, 2);
  }

  @action
  async verifyAttribute(attributeName) {
    await this.cognitoUser.getAttributeVerificationCode(attributeName);
    this.router.transitionTo('attribute-verify', {
      queryParams: { name: attributeName },
    });
  }

  <template>
    <div class="row">
      <div class="col-6">
        <h2>Username</h2>
        <div class="mb-4">
          {{this.currentUser.username}}
        </div>

        <h2>User Attributes</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {{#each @model.attributes as |attr|}}
              <tr>
                <td>{{attr.name}}</td>
                <td>{{attr.value}}</td>
                <td>
                  <LinkTo @route="attribute" @query={{hash name=attr.name}}>
                    Edit
                  </LinkTo>
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
        <LinkTo
          @route="attribute"
          @query={{hash name=undefined}}
          class="btn btn-light btn-block"
        >
          Add attribute
        </LinkTo>
        {{#unless this.emailVerified}}
          <button
            class="btn btn-light btn-block"
            {{on "click" (fn this.verifyAttribute "email")}}
            type="button"
          >
            Verify email
          </button>
        {{/unless}}
        {{#unless this.phoneNumberVerified}}
          <button
            class="btn btn-light btn-block"
            {{on "click" (fn this.verifyAttribute "phone_number")}}
            type="button"
          >
            Verify phone number
          </button>
        {{/unless}}

        <h2 class="mt-4">Actions</h2>
        <LinkTo @route="change-password" class="btn btn-light btn-block">
          Change password
        </LinkTo>
        <LinkTo
          @route="delete-user"
          class="btn btn-outline-danger btn-block mt-3"
        >
          Delete user
        </LinkTo>
      </div>

      <div class="col-6">
        <h2>Cognito Service</h2>
        <dl>
          <dt>Task Duration</dt>
          <dd>{{this.cognito._taskDuration}}</dd>
        </dl>

        <h2>ID Token</h2>
        <dl>
          <dt>Expiration</dt>
          <dd>{{this.idToken.expiration}}</dd>
        </dl>
        <pre><code>{{this.idToken.formatted}}</code></pre>

        <h2>Access Token</h2>
        <dl>
          <dt>Expiration</dt>
          <dd>{{this.accessToken.expiration}}</dd>
        </dl>
        <pre><code>{{this.accessToken.formatted}}</code></pre>

        <h2>Authenticated Data</h2>
        <pre><code>{{this.authenticatedData}}</code></pre>
      </div>
    </div>
  </template>
}
