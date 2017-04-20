(function() {
  /* global AmazonCognitoIdentity */
  function vendorModule() {
    'use strict';

    return {
      'default': self['amazon-cognito-identity-js'],
      __esModule: true,
      AuthenticationDetails: AmazonCognitoIdentity.AuthenticationDetails,
      AuthenticationHelper: AmazonCognitoIdentity.AuthenticationHelper,
      CognitoAccessToken: AmazonCognitoIdentity.CognitoAccessToken,
      CognitoIdToken: AmazonCognitoIdentity.CognitoIdToken,
      CognitoRefreshToken: AmazonCognitoIdentity.CognitoRefreshToken,
      CognitoUser: AmazonCognitoIdentity.CognitoUser,
      CognitoUserAttribute: AmazonCognitoIdentity.CognitoUserAttribute,
      CognitoUserPool: AmazonCognitoIdentity.CognitoUserPool,
      CognitoUserSession: AmazonCognitoIdentity.CognitoUserSession,
      DateHelper: AmazonCognitoIdentity.DateHelper
    };
  }

  define('amazon-cognito-identity-js', [], vendorModule);
})();
