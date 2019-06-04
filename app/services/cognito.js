import CognitoService from 'ember-cognito/services/cognito';
import ENV from '../config/environment';
import { assign } from '@ember/polyfills';

const cognitoEnv = assign({
  // Defaults
}, ENV.cognito);

export default CognitoService.extend({
  poolId: cognitoEnv.poolId,
  clientId: cognitoEnv.clientId,
  authenticationFlowType: cognitoEnv.authenticationFlowType
});
