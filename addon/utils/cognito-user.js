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

  _callback(method) {
    return new RSVP.Promise((resolve, reject) => {
      this.get('user')[method]((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }, `cognito-user#${method}`);
  },

  getSession() {
    return this._callback('getSession');
  },

  getUserAttributes() {
    return this._callback('getUserAttributes');
  },

  signOut() {
    return this.get('user').signOut();
  },

  getStorageData() {
    return this.get('user').storage.getData();
  }
});
