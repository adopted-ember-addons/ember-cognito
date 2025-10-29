import RouteTemplate from 'ember-route-template';
import { fn } from '@ember/helper';

import ChangePasswordRoute from '../components/change-password-route.gjs';
import { transitionToRoute } from '../helpers/transition-to-route.js';

export default RouteTemplate(
  <template>
    <ChangePasswordRoute @onComplete={{fn (transitionToRoute this "index")}} />
  </template>,
);
