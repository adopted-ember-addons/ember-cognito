import { setProperties, get } from '@ember/object';
import { moduleFor } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { settled } from '@ember/test-helpers';

//
// This is an example of writing a unit test that uses sinon
// to stub the Cognito authenticator.
//
// If you wanted to instead write an acceptance test, you could
// get the current session from the app using ember-simple-auth's
// currentSession() helper and use sinon to mock the service that way.
//

moduleFor('controller:login', 'Unit | Controller | login', {
  needs: ['service:session']
});

test('login success', async function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').resolves({});
  setProperties(controller, { username: 'testuser', password: 'pw' });
  controller.send('login', new Event('click'));
  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { username: 'testuser', password: 'pw' }
  ]]);
  await settled();
});

test('login fail', async function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').rejects(new Error('invalid password'));
  setProperties(controller, { username: 'testuser', password: 'pw' });
  controller.send('login', new Event('click'));

  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { username: 'testuser', password: 'pw' }
  ]]);
  await settled();
  assert.equal(get(controller, 'errorMessage'), 'invalid password');
});

test('login newPasswordRequired', async function(assert) {
  let controller = this.subject();
  let err = { state: { name: 'newPasswordRequired' } };
  let stub = this.stub(get(controller, 'session'), 'authenticate').rejects(err);
  setProperties(controller, { username: 'testuser', password: 'pw' });
  controller.send('login', new Event('click'));

  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { username: 'testuser', password: 'pw' }
  ]]);
  await settled();
  assert.equal(get(controller, 'errorMessage'), '');
  assert.equal(get(controller, 'state'), err.state);
});

test('newPasswordRequired success', async function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').resolves({});
  let state = { name: 'newPasswordRequired', arg: 'foo' };
  setProperties(controller, { newPassword: 'pw', state });
  controller.send('newPassword', new Event('click'));
  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { password: 'pw', state }
  ]]);
  await settled();
});

test('newPasswordRequired fail', async function(assert) {
  let controller = this.subject();
  let stub = this.stub(get(controller, 'session'), 'authenticate').rejects(new Error('something went wrong'));
  let state = { name: 'newPasswordRequired', arg: 'foo' };
  setProperties(controller, { newPassword: 'pw', state });
  controller.send('newPassword', new Event('click'));
  assert.deepEqual(stub.args, [[
    'authenticator:cognito',
    { password: 'pw', state }
  ]]);
  await settled();
  assert.equal(get(controller, 'errorMessage'), 'something went wrong');
  assert.equal(get(controller, 'state'), state);
});
