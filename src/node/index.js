var Keen = require("../core"),
    extend = require("../core/utils/extend");

var addEvent = require("../core/lib/addEvent"),
    setGlobalProperties = require("../core/lib/setGlobalProperties"),
    get = require("./lib/get"),
    post = require("./lib/post"),
    del = require("./lib/del");

extend(Keen.prototype, {
  "addEvent"            : addEvent,
  "setGlobalProperties" : setGlobalProperties,
  "get": get,
  "post": post,
  "put": post,
  "del": del
});

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
