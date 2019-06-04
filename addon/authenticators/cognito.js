import { readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { getProperties, set } from '@ember/object';
import Base from 'ember-simple-auth/authenticators/base';
import CognitoUser from '../utils/cognito-user';
import Auth from "@aws-amplify/auth";

export default Base.extend({
  cognito: service(),
  poolId: readOnly('cognito.poolId'),
  clientId: readOnly('cognito.clientId'),
  authenticationFlowType: readOnly('cognito.authenticationFlowType'),

  restore({ poolId, clientId }) {
    Auth.configure({
      userPoolId: poolId,
      userPoolWebClientId: clientId,
    });
    return Auth.currentAuthenticatedUser().then((user) => {
      return this._resolveAuth(poolId, clientId, user);
    });
  },

  _resolveAuth(poolId, clientId, user) {
    set(this, 'cognito.user', CognitoUser.create({ user }));
    // TODO: Do we want to actually put the tokens in the auth data anymore?
    // They won't be refreshed, so they will be invalid after an hour.
    return {"poolId": poolId, "clientId": clientId};
  },

  // _handleRefresh(/* params */) {
  //   let user = get(this, 'cognito.user');
  //   // Get the session, which will refresh it if necessary
  //   return user.getSession().then((session) => {
  //     if (session.isValid()) {
  //       get(this, 'cognito').startRefreshTask(session);
  //       let newData = user.getStorageData();
  //       newData.access_token = session.getIdToken().getJwtToken();
  //       // newData.refreshed = new Date().toISOString();
  //       newData.poolId = this.get('poolId');
  //       newData.clientId = this.get('clientId');
  //       return newData;
  //     } else {
  //       return reject('session is invalid');
  //     }
  //   });
  // },

  // _handleNewPasswordRequired({ state, password }) {
  //   return new Promise((resolve, reject) => {
  //     let that = this;
  //     let userAttrs = state.userAttributes;
  //     // the api doesn't accept these fields back
  //     delete userAttrs.phone_number_verified;
  //     delete userAttrs.email_verified;
  //     state.user.completeNewPasswordChallenge(password, state.userAttributes, {
  //       onSuccess(result) {
  //         that._resolveAuth(resolve, result, state);
  //       },
  //       onFailure(err) {
  //         reject(err);
  //       }
  //     });
  //   }, 'cognito:newPasswordRequired');
  // },

  // _handleState(name, params) {
  //   if (name === 'refresh') {
  //     return this._handleRefresh(params);
  //   } else if (name === 'newPasswordRequired') {
  //     return this._handleNewPasswordRequired(params);
  //   } else {
  //     throw new Error('invalid state');
  //   }
  // },

  authenticate(params) {
    let { username, password, state } = params;
    if (state) {
      return this._handleState(state.name, params);
    }

    let { poolId, clientId, authenticationFlowType } =
      getProperties(this, 'poolId', 'clientId', 'authenticationFlowType');
    Auth.configure({
      userPoolId: poolId,
      userPoolWebClientId: clientId,
      authenticationFlowType,
      // TODO: Do we need Cognito Storage anymore>
      // TODO: Add other Cognito configuration?
    });

    // TODO: Handle rejection states -- new password required, etc.
    return Auth.signIn({ username, password }).then((user) => {
      return this._resolveAuth(poolId, clientId, user);
    });
  },

  invalidate(data) {
    return Auth.signOut().then(() => {
      set(this, 'cognito.user', undefined);
      return data;
    });
  }
});
