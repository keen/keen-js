requirejs.config({
  paths: {
    // complete version + plugins
      "keen"              : "../../../dist/keen"
    , "keen/googlecharts" : "../../../dist/plugins/keen-googlecharts"
    , "keen/widgets"      : "../../../dist/plugins/keen-widgets"
    , "keen/test-plugin"  : "./test-plugin"
    // tracking-only version
    , "keen-tracker"      : "../../../dist/keen-tracker"
  }
});

require([
    "keen-tracker"
  , "keen"
  , "keen/googlecharts"
  , "keen/widgets"
  , "keen/test-plugin"

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
  console.log('TRACKER', tracker);
});
