/* eslint-env node */
/* eslint-disable object-shorthand */

module.exports = {
  description: '',

  afterInstall: function() {
    return this.addPackagesToProject([
      { name: 'amazon-cognito-identity-js' }
    ]);
  }
};
