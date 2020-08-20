import Route from '@ember/routing/route';
import { inject as service } from "@ember/service";

export default Route.extend({
  cognito: service(),

  model() {
    let state = this.cognito.state;
    if (state && state.name === "newPasswordRequired") {
      return state;
    } else {
      this.transitionTo("login");
    }
  }
});
