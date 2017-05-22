/* eslint-env node */
/* eslint-disable object-shorthand */
'use strict';

module.exports = {
  name: 'ember-cognito',
  options: {
    nodeAssets: {
      'amazon-cognito-identity-js': function() {
        return {
          vendor: {
            srcDir: 'dist',
            include: [
              'aws-cognito-sdk.js',
              'amazon-cognito-identity.min.js',
              'amazon-cognito-identity.min.js.map'
            ]
          }
        };
      }
    }
  },
  included: function(app) {
    this._super.included.apply(this, arguments);
    app.import('vendor/amazon-cognito-identity-js/aws-cognito-sdk.js');
    app.import('vendor/amazon-cognito-identity-js/amazon-cognito-identity.min.js');
    app.import('vendor/shims/amazon-cognito-identity-js.js');
  }
};
