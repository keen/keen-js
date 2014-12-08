var Keen = require("../core"),
    extend = require("../core/utils/extend");

extend(Keen.prototype, {
  "addEvent"            : require("../core/lib/addEvent"),
  "setGlobalProperties" : require("../core/lib/setGlobalProperties")
});

Keen.requestHandler = require("./utils/requestHandler");

module.exports = Keen;

// -------------------------

Keen.debug = true;
Keen.on("client", function(client){
  client.writeKey("write-key");
  client.readKey("read-key");
  console.log(client);
});
var client = new Keen({
  masterKey: "TADA!",
  projectId: "234234"
});
client.addEvent("test");
