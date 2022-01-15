import { helper } from '@ember/component/helper';

//
// This can be used within a route template to define an action
// that transitions to another route:
// onConfirm={{action (transition-to-route this "confirm")}}
//
export function transitionToRoute([obj, route] /*, hash*/) {
  return function () {
    obj.transitionToRoute(route);
  };
}

export default helper(transitionToRoute);
