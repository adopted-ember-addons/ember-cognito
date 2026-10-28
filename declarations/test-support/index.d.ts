export function newUser(username: any): AWSUser;
export function mockCognitoUser(userAttributes: any): void;
export function unmockCognitoUser(): void;
export function mockAuth(authClassOrInstance?: typeof MockAuth): void;
export * from "./utils/-mock-auth.js";
import { CognitoUser as AWSUser } from 'amazon-cognito-identity-js';
import MockAuth from './utils/-mock-auth.js';
import { MockUser } from './utils/ember-cognito.js';
export { MockUser, MockAuth };
//# sourceMappingURL=index.d.ts.map