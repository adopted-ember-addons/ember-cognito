import Component from '@ember/component';
import layout from '../templates/components/index-auth';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';

export default Component.extend({
  layout,
  currentUser: service(),
  cognito: service(),
  session: service(),
  cognitoUser: readOnly('cognito.user'),

  init() {
    this._super(...arguments);
    this.getSession();
  },

  getSession() {
    // Fetch the cognito session
    let cognitoUser = this.get('cognitoUser');
    if (cognitoUser) {
      return cognitoUser.getSession().then((session) => {
        // It can happen in acceptance tests that 'session' is falsey
        if (session) {
          this.set('cognitoSession', session);
        }
      });
    }
  },

  tokenInfo(token) {
    return {
      expiration: new Date(token.getExpiration() * 1000),
      formatted: JSON.stringify(token.payload, undefined, 2)
    };
  },

  accessToken: computed('cognitoSession', function() {
    let session = this.get('cognitoSession');
    if (session) {
      return this.tokenInfo(session.getAccessToken());
    }
  }),

  idToken: computed('cognitoSession', function() {
    let session = this.get('cognitoSession');
    if (session) {
      return this.tokenInfo(session.getIdToken());
    }
  }),

  authenticatedData: computed('session.data', function() {
    return JSON.stringify(this.get('session.data'), undefined, 2);
  })
});
