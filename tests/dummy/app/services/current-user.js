import Ember from 'ember';

const {
  computed: { readOnly },
  inject: { service },
  RSVP,
  Service
} = Ember;

export default Service.extend({
  session: service(),
  cognito: service(),
  cognitoUser: readOnly('cognito.user'),
  username: readOnly('cognitoUser.username'),

  load() {
    if (this.get('session.isAuthenticated')) {
      return this.get('cognitoUser').getUserAttributes().then((userAttributes) => {
        userAttributes.forEach((attr) => {
          this.set(attr.getName(), attr.getValue());
        });
      });
    } else {
      return RSVP.resolve();
    }
  }
});
