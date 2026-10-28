export default class CognitoUser extends EmberObject {
    get username(): any;
    get attributes(): any;
    _callback(method: any, ...args: any[]): any;
    changePassword(oldPassword: any, newPassword: any): any;
    deleteAttributes(attributeList: any): any;
    deleteUser(): any;
    getAttributeVerificationCode(attributeName: any): any;
    getSession(): any;
    getUserAttributes(): any;
    getUserAttributesHash(): Promise<any>;
    signOut(): any;
    updateAttributes(attributes: any): any;
    verifyAttribute(attributeName: any, confirmationCode: any): any;
    getGroups(): Promise<any>;
}
import EmberObject from '@ember/object';
//# sourceMappingURL=cognito-user.d.ts.map