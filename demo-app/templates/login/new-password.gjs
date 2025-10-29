import RouteTemplate from 'ember-route-template';
import LoginNewPasswordRoute from '../../components/login-new-password-route.gjs';

export default RouteTemplate(
  <template><LoginNewPasswordRoute @model={{this.model}} /></template>,
);
