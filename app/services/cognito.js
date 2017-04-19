import CognitoService from 'ember-cognito/services/cognito';
import ENV from '../config/environment';

const cognitoEnv = ENV.cognito || {};

export default CognitoService.extend({
  poolId: cognitoEnv.poolId,
  clientId: cognitoEnv.clientId
});
