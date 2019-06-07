import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  cognito: service(),

  model({ name }) {
    if (name) {
      return this.get('cognito.user').getUserAttributesHash().then((attrs) => {
        const value = attrs[name];
        return { name, value };
      });
    }
    return { isNew: true };
  }
});
