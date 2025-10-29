'use strict';

const testing = [
  '^ember-cli-htmlbars($|\\/)',
  '^qunit',
  '^ember-qunit',
  '^@ember/test-helpers',
  '^ember-exam',
  '^ember-cli-mirage',
  '^sinon',
  '^ember-sinon-qunit',
  '^(@[^\\/]+\\/)?[^\\/]+\\/test-support($|\\/)',
].join('|');

const emberCore = [
  '^ember$',
  '^@ember\\/',
  '^ember-data($|\\/)',
  '^@ember-data\\/',
  '^@glimmer\\/',
  '^require$',
].join('|');

const emberAddons = ['^@?ember-', '^@[^\\/]+\\/ember($|\\/|-)'].join('|');

const internalPackages = ['^ember-cognito/(.*)$', '^#src/(.*)$', '^[./]'].join(
  '|',
);

const importOrder = [
  testing,
  emberCore,
  emberAddons,
  '<THIRD_PARTY_MODULES>',
  internalPackages,
];
const importOrderParserPlugins = ['typescript', 'decorators-legacy'];

module.exports = {
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-ember-template-tag',
  ],
  importOrder,
  importOrderParserPlugins,
  overrides: [
    {
      files: '*.{js,gjs,ts,gts,mjs,mts,cjs,cts}',
      options: {
        singleQuote: true,
        templateSingleQuote: false,
      },
    },
  ],
};
