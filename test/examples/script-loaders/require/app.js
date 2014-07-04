require([
    "keen-amd/keen"
  ], function(Keen) {

  var client = new Keen({
    projectId: "123",
    writeKey: "456",
    readKey: "789"
  });
  Keen.log(client);

  Keen.log('Keen.Dataform', Keen.Dataform);
  Keen.log('Keen.utils.domready', Keen.utils.domready);
  Keen.log('Keen.Spinner', Keen.Spinner);

  Keen.ready(function(){
    Keen.log(google);
    Keen.log(Keen.Visualization.libraries);
  });
});
