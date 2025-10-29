import RouteTemplate from 'ember-route-template';
import { fn } from '@ember/helper';
import { transitionToRoute } from '../../helpers/transition-to-route.js';
import LoginIndexRoute from '../../components/login-index-route.gjs';

export default RouteTemplate(
  <template>
    <LoginIndexRoute
      @onNewPasswordRequired={{fn
        (transitionToRoute this "login.new-password")
      }}
    />
  </template>,
);
