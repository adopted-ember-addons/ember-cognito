export default class CognitoAuthenticator extends Base {
    cognito: any;
    restore({ poolId, clientId }: {
        poolId: any;
        clientId: any;
    }): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    _makeAuthData(user: any, session: any): {
        poolId: any;
        clientId: any;
        access_token: any;
    };
    _resolveAuth(user: any): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    _handleSignIn(user: any): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    _handleNewPasswordRequired({ password, state: { user } }: {
        password: any;
        state: {
            user: any;
        };
    }): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    _handleRefresh(): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    _handleState(name: any, params: any): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    authenticate(params: any): Promise<{
        poolId: any;
        clientId: any;
        access_token: any;
    }>;
    invalidate(data: any): Promise<any>;
}
import Base from 'ember-simple-auth/authenticators/base';
//# sourceMappingURL=cognito.d.ts.map