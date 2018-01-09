import Service from '@ember/service';
import { Promise } from 'rsvp';
import { CognitoUserPool } from "amazon-cognito-identity-js";
import CognitoStorage from '../utils/cognito-storage';
import CognitoUser from '../utils/cognito-user';

/**
 * @public
 * This is a container for easily accessing the logged-in CognitoUser object,
 * as well as creating others using signUp().
 */
export default Service.extend({
  // Primarily used so we can stub methods.
  _stubPool(pool) {
    return pool;
  },

  /**
   * Method for signing up a user.
   *
   * @param username User's username
   * @param password Plain-text initial password entered by user.
   * @param attributeList New user attributes.
   * @param validationData Application metadata.
   */
  signUp(username, password, attributeList, validationData) {
    let { poolId, clientId } = this.getProperties('poolId', 'clientId');
    let pool = this._stubPool(new CognitoUserPool({
      UserPoolId: poolId,
      ClientId: clientId,
      Storage: new CognitoStorage({})
    }));

    return new Promise((resolve, reject) => {
      pool.signUp(username, password, attributeList, validationData, (err, result) => {
        if (err) {
          reject(err);
        } else {
          result.user = CognitoUser.create({ user: result.user });
          resolve(result);
        }
      });
    }, `cognito-service#signUp`);
  }
});
