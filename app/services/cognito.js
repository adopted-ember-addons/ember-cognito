import CognitoService from 'ember-cognito/services/cognito';
import ENV from '../config/environment';

const cognitoEnv = Object.assign(
  {
    autoRefreshSession: false,
  },
  ENV.cognito,
);

export default CognitoService.extend({
  poolId: cognitoEnv.poolId,
  clientId: cognitoEnv.clientId,
  autoRefreshSession: cognitoEnv.autoRefreshSession,
  authenticationFlowType: cognitoEnv.authenticationFlowType,
});
