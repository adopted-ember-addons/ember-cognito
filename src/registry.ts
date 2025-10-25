import { buildRegistry } from 'ember-strict-application-resolver/build-registry';

export default buildRegistry({
  ...import.meta.glob('./authenticators/*', { eager: true }),
  ...import.meta.glob('./services/*', { eager: true }),
});
