
import { _ as __glob__0_0 } from './cognito-DdVybbdH.js';
import { _ as __glob__1_1 } from './cognito-hDPf7V8c.js';
import CookiesService from 'ember-cookies/services/cookies';
import SessionStoreApplication from 'ember-simple-auth/session-stores/application';
import { buildRegistry } from 'ember-strict-application-resolver/build-registry';

var registry = buildRegistry({
  './services/cookies': CookiesService,
  './session-stores/application': SessionStoreApplication,
  ...{
    "./authenticators/cognito.js": __glob__0_0
  },
  ...{
    "./services/cognito.js": __glob__1_1
  }
});

export { registry as default };
//# sourceMappingURL=registry.js.map
