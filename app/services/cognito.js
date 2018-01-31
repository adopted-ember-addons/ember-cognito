import CognitoService from 'ember-cognito/services/cognito';
import ENV from '../config/environment';
import { merge } from '@ember/polyfills';

const cognitoEnv = merge({
  autoRefreshSession: false
}, ENV.cognito);

export default CognitoService.extend({
  poolId: cognitoEnv.poolId,
  clientId: cognitoEnv.clientId,
  autoRefreshSession: cognitoEnv.autoRefreshSession
});
