import RouteTemplate from 'ember-route-template';
import RegisterIndexRoute from '../../components/register-index-route.gjs';
import { transitionToRoute } from '../../helpers/transition-to-route.js';
import { fn } from '@ember/helper';

export default RouteTemplate(
  <template>
    <RegisterIndexRoute
      @onComplete={{fn (transitionToRoute this "index")}}
      @onConfirmationRequired={{fn (transitionToRoute this "register.confirm")}}
    />
  </template>,
);
