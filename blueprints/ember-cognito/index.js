/* eslint-env node */
/* eslint-disable object-shorthand */

module.exports = {
  description: 'Default ember-cognito blueprint.',
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addPackagesToProject([
      { name: 'amazon-cognito-identity-js' }
    ]);
  }
};
