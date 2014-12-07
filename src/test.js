var Keen = require("./keen");

// Keen.enabled = true;
Keen.debug = true;
Keen.on("client", function(client){
  client.writeKey("write-key");
  client.readKey("read-key");
  // console.log(client);
});

var client = new Keen({
  masterKey: "TADA!",
  projectId: "234234"
});

client.on("error", function(msg){
  Keen.log(msg);
});

client.addEvent("test", {});
