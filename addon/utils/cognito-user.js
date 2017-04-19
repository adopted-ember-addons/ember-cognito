import Ember from 'ember';

const {
  computed,
  Object: EmberObject,
  RSVP
} = Ember;

//
// Wraps an AWS CognitoUser and provides promisified versions of many functions.
//
export default EmberObject.extend({
  username: computed('user', function() {
    return this.get('user').getUsername();
  }),

  getSession() {
    return new RSVP.Promise((resolve, reject) => {
      this.get('user').getSession((err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve(session);
        }
      });
    }, 'cognito-user#getSession');
  },

  getUserAttributes() {
    return new RSVP.Promise((resolve, reject) => {
      this.get('user').getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
        } else {
          resolve(attributes);
        }
      });
    }, 'cognito-user#getUserAttributes');
  },

  signOut() {
    return this.get('user').signOut();
  },

  getStorageData() {
    return this.get('user').storage.getData();
  }
});
