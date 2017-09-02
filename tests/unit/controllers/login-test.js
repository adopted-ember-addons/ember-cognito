import Ember from 'ember';
import { moduleFor } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import wait from 'ember-test-helpers/wait';

const {
  RSVP,
  get,
  setProperties
} = Ember;

//
// This is an example of writing a unit test that uses sinon
// to stub the Cognito authenticator.
//
// If you wanted to instead write an acceptance test, you could
// get the current session from the app using ember-simple-auth's
// currentSession() helper and use sinon to mock the service that way.
//
// NOTE: these tests use sinon.stub.callsFake() rather than sinon.stub.resolves/rejects
// because PhantomJS doesn't support native promises. If you polyfill Promise
// or don't care about PhantomJS, you can switch to using stub.resolves/rejects.
//

moduleFor('controller:login', 'Unit | Controller | login', {
  needs: ['service:session']
});

function resolves(value) {
  return () => RSVP.resolve(value);
}

function rejects(value) {
  return () => RSVP.reject(value);
}

test('login success', function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').callsFake(resolves({}));
  setProperties(controller, { username: 'testuser', password: 'pw' });
  controller.send('login', new Event('click'));
  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { username: 'testuser', password: 'pw' }
  ]]);
  return wait();
});

test('login fail', function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').callsFake(rejects(new Error('invalid password')));
  setProperties(controller, { username: 'testuser', password: 'pw' });
  controller.send('login', new Event('click'));

  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { username: 'testuser', password: 'pw' }
  ]]);
  return wait().then(() => {
    assert.equal(get(controller, 'errorMessage'), 'invalid password');
  });
});

test('login newPasswordRequired', function(assert) {
  let controller = this.subject();
  let err = { state: { name: 'newPasswordRequired' } };
  let stub = this.stub(get(controller, 'session'), 'authenticate').callsFake(rejects(err));
  setProperties(controller, { username: 'testuser', password: 'pw' });
  controller.send('login', new Event('click'));

  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { username: 'testuser', password: 'pw' }
  ]]);
  return wait().then(() => {
    assert.equal(get(controller, 'errorMessage'), '');
    assert.equal(get(controller, 'state'), err.state);
  });
});

test('newPasswordRequired success', function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').callsFake(resolves({}));
  let state = { name: 'newPasswordRequired', arg: 'foo' };
  setProperties(controller, { newPassword: 'pw', state });
  controller.send('newPassword', new Event('click'));
  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { password: 'pw', state }
  ]]);
  return wait();
});

test('newPasswordRequired fail', function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').callsFake(rejects(new Error('something went wrong')));
  let state = { name: 'newPasswordRequired', arg: 'foo' };
  setProperties(controller, { newPassword: 'pw', state });
  controller.send('newPassword', new Event('click'));
  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { password: 'pw', state }
  ]]);
  return wait().then(() => {
    assert.equal(get(controller, 'errorMessage'), 'something went wrong');
    assert.equal(get(controller, 'state'), state);
  });
});
