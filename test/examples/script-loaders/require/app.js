
requirejs.config({
  paths: {
    /* Set "keen" module ID for plugins */
    "keen": "../../../dist/keen"
  }
});

require([
  // 1) Use tracking-only directly or w/ path ID
  "../../../dist/keen-tracker"

  // 2) Use source directly without plugins
  , "../../../dist/keen"

  /* 3) Use "keen" path when loading plugins
  , "keen"
  , "./test-plugin"
  , "../../../dist/plugins/keen-googlecharts"
  , "../../../dist/plugins/keen-widgets"
  */

], function(KeenTracker, KeenAMD) { // KeenTracker,

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
