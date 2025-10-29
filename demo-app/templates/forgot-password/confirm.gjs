import RouteTemplate from 'ember-route-template';
import ForgotPasswordConfirmRoute from '../../components/forgot-password-confirm-route.gjs';
import { fn } from '@ember/helper';
import { transitionToRoute } from '../../helpers/transition-to-route.js';

export default RouteTemplate(
  <template>
    <ForgotPasswordConfirmRoute
      @onComplete={{fn (transitionToRoute this "login")}}
    />
  </template>,
);
