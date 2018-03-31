/* eslint-env node */
'use strict';
const VersionChecker = require('ember-cli-version-checker');

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
    let checker = new VersionChecker(this);
    let cognito = checker.for('amazon-cognito-identity-js');
    if (cognito.lt('2.0.2')) {
      app.import('vendor/amazon-cognito-identity-js/aws-cognito-sdk.js');
    }
    app.import('vendor/amazon-cognito-identity-js/amazon-cognito-identity.min.js');
    app.import('vendor/shims/amazon-cognito-identity-js.js');
  }
};
