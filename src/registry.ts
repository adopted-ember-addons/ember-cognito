import CookiesService from 'ember-cookies/services/cookies';
import SessionStoreApplication from 'ember-simple-auth/session-stores/application';
import { buildRegistry } from 'ember-strict-application-resolver/build-registry';

export default buildRegistry({
  './services/cookies': CookiesService,
  './session-stores/application': SessionStoreApplication,
  ...import.meta.glob('./authenticators/*.{js,ts}', { eager: true }),
  ...import.meta.glob('./services/*.{js,ts}', { eager: true }),
});
