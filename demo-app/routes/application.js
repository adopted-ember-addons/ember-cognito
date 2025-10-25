import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class Application extends Route {
  @service currentUser;
  @service session;

  async beforeModel() {
    await this.session.setup();
    try {
      await this.currentUser.load();
    } catch {
      await this.invalidate();
    }
  }
}
