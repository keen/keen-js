requirejs.config({
  paths: {
    "keen": "../../../dist/keen"
  }
});

require([ "keen", "./test-plugin" ], function(KeenAMD) {

  console.log(arguments);
  console.log(require.s.contexts._.defined);
  console.log(require.s.contexts._.registry);

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
});
