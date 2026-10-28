/**
 * @public
 * This is a container for easily accessing the logged-in CognitoUser object,
 * as well as creating others using signUp().
 */
export default class CognitoService extends Service {
    constructor(...args: any[]);
    session: any;
    clientId: any;
    poolId: any;
    auth: typeof Auth;
    autoRefreshSession: any;
    authenticationFlowType: any;
    willDestroy(...args: any[]): void;
    /**
     * Configures the Amplify library with the pool & client IDs, and any additional
     * configuration.
     * @param awsconfig Extra AWS configuration.
     */
    configure(awsconfig: any): void;
    /**
     * Method for signing up a user.
     *
     * @param username User's username
     * @param password Plain-text initial password entered by user.
     * @param attributes New user attributes.
     * @param validationData Application metadata.
     */
    signUp(username: any, password: any, attributes: any, validationData: any): Promise<Auth.SignUpOutput>;
    /**
     * Confirm signup for user.
     * @param username User's username.
     * @param code The confirmation code.
     * @returns {Promise<any>}
     */
    confirmSignUp(username: any, code: any, options: any): Promise<any>;
    /**
     * Resends the sign up code.
     * @param username User's username.
     * @returns {*|Promise<string>}
     */
    resendSignUp(username: any): any | Promise<string>;
    /**
     * Sends a user a code to reset their password.
     * @param username
     * @returns {*|Promise<any>|RSVP.Promise|void}
     */
    forgotPassword(username: any): any | Promise<any> | RSVP.Promise | void;
    /**
     * Submits a new password.
     * @param username User's username.
     * @param code The verification code sent by forgotPassword.
     * @param newPassword The user's new password.
     * @returns {*|Promise<void>|void}
     */
    forgotPasswordSubmit(username: any, code: any, newPassword: any): any | Promise<void> | void;
    /**
     * Enable the token refresh timer.
     */
    startRefreshTask(session: any): void;
    /**
     * Disable the token refresh timer.
     */
    stopRefreshTask(): void;
    refreshSession(): any;
    /**
     * A helper that resolves to the logged in user's id token.
     */
    getIdToken(): Promise<any>;
    _setUser(awsUser: any): CognitoUser;
}
import Service from '@ember/service';
import * as Auth from '@aws-amplify/auth';
import CognitoUser from '../utils/cognito-user.js';
//# sourceMappingURL=cognito.d.ts.map