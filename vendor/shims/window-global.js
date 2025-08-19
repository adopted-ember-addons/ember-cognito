(function () {
  /* workaround for:
  https://github.com/feross/buffer/issues/140 and
  https://github.com/aws/aws-sdk-js/pull/1596
   */
  window.global = window;
})();
