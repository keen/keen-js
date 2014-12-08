var Keen = require("../core"),
    extend = require("../core/utils/extend");

extend(Keen.prototype, {
  "addEvent"            : require("../core/lib/addEvent"),
  "setGlobalProperties" : require("../core/lib/setGlobalProperties")
});

Keen.requestHandler = require("./utils/requestHandler");

module.exports = Keen;

// -------------------------

// Keen.enabled = false;
Keen.debug = true;
Keen.on("client", function(client){
  client.writeKey("123456789");
  client.readKey("987654321");
  console.log(client);
});

var client = new Keen({
  masterKey: "TADA!",
  projectId: "234234"
});

client.addEvent("test", {}, function(err, res){
  console.log(err, res);
});
