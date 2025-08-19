import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class LoginNewPasswordRoute extends Route {
  @service cognito;
  @service router;

  model() {
    let state = this.cognito.state;
    if (state && state.name === 'newPasswordRequired') {
      return state;
    } else {
      this.router.transitionTo('login');
    }
  }
}
