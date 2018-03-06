import { setProperties, get } from '@ember/object';
import { module } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinonTest from 'ember-sinon-qunit/test-support/test';
import { settled } from '@ember/test-helpers';

//
// This is an example of writing a unit test that uses sinon to stub the Cognito authenticator.
//

module('Unit | Controller | login', function(hooks) {
  setupTest(hooks);

  sinonTest('login success', async function(assert) {
    let controller = this.owner.lookup('controller:login');
    let stub = this.stub(get(controller, 'session'), 'authenticate').resolves({});
    setProperties(controller, { username: 'testuser', password: 'pw' });
    controller.send('login', new Event('click'));
    assert.deepEqual(stub.args, [[
      'authenticator:cognito',
      { username: 'testuser', password: 'pw' }
    ]]);
    await settled();
  });

  sinonTest('login fail', async function(assert) {
    let controller = this.owner.lookup('controller:login');
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

  sinonTest('login newPasswordRequired', async function(assert) {
    let controller = this.owner.lookup('controller:login');
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

  sinonTest('newPasswordRequired success', async function(assert) {
    let controller = this.owner.lookup('controller:login');
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

  sinonTest('newPasswordRequired fail', async function(assert) {
    let controller = this.owner.lookup('controller:login');
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
});
