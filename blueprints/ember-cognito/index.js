/* eslint-env node */
module.exports = {
  description: '',

  afterInstall: function(options) {
    return this.addPackagesToProject([
      {name: 'amazon-cognito-identity-js'}
    ]);
  }
};
