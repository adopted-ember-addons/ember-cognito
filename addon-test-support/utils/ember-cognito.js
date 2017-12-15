import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import EmberObject, { get, set } from '@ember/object';
import RSVP from 'rsvp';

const MockUser = EmberObject.extend({
  userAttributes: [],

  getGroups() {
    return RSVP.resolve(get(this, 'groups'));
  },

  getSession() {
    return RSVP.resolve(get(this, 'session'));
  },

  getUserAttributes() {
    return RSVP.resolve(get(this, 'userAttributes').map(({ name, value }) => {
      return new CognitoUserAttribute({ Name: name, Value: value });
    }));
  }
});

export { MockUser };
