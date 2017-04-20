import Ember from 'ember';

const {
  Controller,
  inject: { service }
} = Ember;

export default Controller.extend({
  currentUser: service(),
  attributes: [
    'sub',
    'username',
    'email',
    'email_verified'
  ]
});
