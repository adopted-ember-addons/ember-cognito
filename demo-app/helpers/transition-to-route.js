//
// This can be used within a route template to define an action
// that transitions to another route:
// onConfirm={{fn (transitionToRoute this "confirm")}}
//
export function transitionToRoute([obj, route] /*, hash*/) {
  return function () {
    obj.transitionToRoute(route);
  };
}
