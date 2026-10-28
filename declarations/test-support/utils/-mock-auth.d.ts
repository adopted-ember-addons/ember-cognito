export function makeToken({ duration, header, extra, }?: {
    duration?: number | undefined;
    header?: string | undefined;
    extra?: {} | undefined;
}): string;
export function newSession({ idToken, refreshToken, accessToken }?: {}): CognitoUserSession;
export default class MockAuth extends EmberObject {
    configure(awsconfig: any): void;
    signUp(): any;
    _resolveAuthedUser(msg: any): any;
    signIn(): any;
    signOut(): any;
    currentAuthenticatedUser(): any;
    completeNewPassword(): any;
    currentSession(): any;
    userAttributes(): any;
}
import { CognitoUserSession } from 'amazon-cognito-identity-js';
import EmberObject from '@ember/object';
//# sourceMappingURL=-mock-auth.d.ts.map