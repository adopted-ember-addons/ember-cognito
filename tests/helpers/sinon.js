import sinon from "sinon";

export default function setupSinonTest(hooks) {
  hooks.beforeEach(function() {
    this.sinon = sinon.createSandbox();
  });
  hooks.afterEach(function() {
    this.sinon.restore();
  });
}
