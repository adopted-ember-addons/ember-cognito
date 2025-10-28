import RouteTemplate from 'ember-route-template';
import RegisterResendRoute from '../../components/register-resend-route.gjs';
import { transitionToRoute } from '../../helpers/transition-to-route.js';
import { fn } from '@ember/helper';

export default RouteTemplate(
  <template>
    <RegisterResendRoute
      @onComplete={{fn (transitionToRoute this "register.confirm")}}
    />
  </template>,
);
