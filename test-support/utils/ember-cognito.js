import Ember from 'ember';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

const {
  Object: EmberObject,
  RSVP
} = Ember;

const MockUser = EmberObject.extend({
  userAttributes: [],

  getUserAttributes() {
    return RSVP.resolve(this.get('userAttributes').map(({ name, value }) => {
      return new CognitoUserAttribute({ Name: name, Value: value })
    }));
  }
});

export { MockUser };
