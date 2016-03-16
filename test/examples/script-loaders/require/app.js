requirejs.config({
  paths: {
    "keen": "../../../dist/keen"
    // "keen": "//d26b395fwzu5fz.cloudfront.net/3.4.1-rc1/keen"
  }
});

require(["keen"], function(KeenAMD) {

  console.log(arguments);

  // ---------------------------------

  var client = new KeenAMD({
    projectId: "123",
    writeKey: "456",
    readKey: "789"
  });

  console.log('CLIENT', client);
  console.log('Keen.Dataform', typeof Keen.Dataset === 'function');
  console.log('Keen.utils.domready', typeof Keen.utils.domready === 'function');
  console.log('Keen.Spinner', typeof Keen.Spinner === 'function');
  console.log('KeenAMD.Visualization.libraries', KeenAMD.Dataviz.libraries);

  KeenAMD.ready(function(){
    console.log('--------------------');
    console.log('GOOGLE', google);
    console.log(KeenAMD.Dataviz.libraries);
    console.log('--------------------');
  });

  console.log(KeenAMD.Dataviz.libraries['c3']);
  console.log(KeenAMD.Dataviz.libraries['chartjs']);
});
