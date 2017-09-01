import Ember from 'ember';

const {
  computed,
  Object: EmberObject,
  RSVP,
  get
} = Ember;

//
// Wraps an AWS CognitoUser and provides promisified versions of many functions.
//
export default EmberObject.extend({
  username: computed('user', function() {
    return get(this, 'user').getUsername();
  }),

  _callback(method) {
    return new RSVP.Promise((resolve, reject) => {
      get(this, 'user')[method]((err, result) => {
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
    return get(this, 'user').signOut();
  },

  getStorageData() {
    return get(this, 'user').storage.getData();
  }
});
