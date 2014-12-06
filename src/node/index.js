// var request  = require("superagent");
// var domready = require("domready"),
// var Spinner  = require("spin.js");

var Keen = require("../core");

// tell the lib which requestHandler to use

Keen.requestHandler = require("../core/utils/requestHandler");
// Keen.requestHandler = require("../node/utils/requestHandler");

Keen.utils.extend(Keen.prototype, {
  "addEvent": require("../core/lib/addEvent")
  // "run": require("../query")
  // "draw": require("../dataviz")
});

// Keen.enabled = false;
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

// Keen.Query = require("../query");
// Keen.Request = require("../query/request")

// Keen.Dataset = require("../dataset");
// Keen.Dataviz = require("../dataviz");
// module.exports = Keen;
