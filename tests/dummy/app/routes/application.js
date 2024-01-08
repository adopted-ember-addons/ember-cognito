import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class Application extends Route {
  @service currentUser;
  @service session;

  async beforeModel() {
    await this.session.setup();
    try {
      await this.currentUser.load();
    } catch (err) {
      await this.invalidate();
    }
  }
}
