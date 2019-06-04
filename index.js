/* eslint-env node */
'use strict';
const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,
  included: function(app) {
    this._super.included.apply(this, arguments);
    app.import('vendor/shims/window-global.js');
  }
};
