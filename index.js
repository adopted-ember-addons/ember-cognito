/* eslint-env node */
'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    autoImport:{
      webpack: {
        node: { crypto: true }
      }
    }
  },
  included: function(app) {
    this._super.included.apply(this, arguments);
    app.import('vendor/shims/window-global.js');
  }
};
