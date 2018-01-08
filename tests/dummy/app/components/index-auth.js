import Component from '@ember/component';
import layout from '../templates/components/index-auth';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  currentUser: service(),
});
