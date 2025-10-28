import { fn } from '@ember/helper';
import RouteTemplate from 'ember-route-template';
import AttributeVerifyRoute from '../components/attribute-verify-route.gjs';
import { transitionToRoute } from '../helpers/transition-to-route.js';

export default RouteTemplate(
  <template>
    <AttributeVerifyRoute
      @name={{this.name}}
      @onComplete={{fn (transitionToRoute this "index")}}
    />
  </template>,
);
