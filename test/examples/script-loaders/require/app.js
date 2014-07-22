requirejs.config({
  paths: {
    // complete version + plugins
    // Map "keen" module ID to source
      "keen"              : "../../../dist/keen"
    //, "keen/googlecharts" : "../../../dist/plugins/keen-googlecharts"
    //, "keen/keen-widgets" : "../../../dist/plugins/keen-widgets"
    //, "keen/test-plugin"  : "./test-plugin"
  },

  // Use bundles to "unpack" modules from the CDN distro
  bundles: {
    "keen": ["keen/googlecharts", "keen/keenwidgets"]
  }
});

require([
  // 1) Use tracking-only directly or w/ path ID
  "../../../dist/keen-tracker",

  // 2) Use source directly without plugins
  //"../../../dist/keen"

  /* 3) Use "keen" when unpacking from bundles */
  "keen"
  , "keen/googlecharts"
  , "keen/keenwidgets"
  , "./test-plugin"

  /* 4) Use "keen" when loading plugins from elsewhere
  "keen"
  , "../../../dist/plugins/keen-googlecharts"
  , "../../../dist/plugins/keen-widgets"
  , "./test-plugin" */

], function(KeenTracker, KeenAMD) {

  console.log(arguments);
  console.log(require.s.contexts._.defined);

  // ---------------------------------

  var client = new KeenAMD({
    projectId: "123",
    writeKey: "456",
    readKey: "789"
  });
  console.log('CLIENT', client);
  console.log('Keen.Dataform', typeof Keen.Dataform === 'function');
  console.log('Keen.utils.domready', typeof Keen.utils.domready === 'function');
  console.log('Keen.Spinner', typeof Keen.Spinner === 'function');
  console.log('KeenAMD.Visualization.libraries', KeenAMD.Visualization.libraries);

  KeenAMD.ready(function(){
    console.log('--------------------');
    console.log('GOOGLE', google);
    console.log(KeenAMD.Visualization.libraries);
    console.log('--------------------');
  });

  // ---------------------------------

  var tracker = new KeenTracker({
    projectId: "123",
    writeKey: "456",
    readKey: "789"
  });
  KeenTracker.ready(function(){
    console.log('TRACKER', tracker);
  });

});
