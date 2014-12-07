var Keen = require("./core"),
    requestHandler = require("./core/utils/requestHandler"),
    trackExternalLink = require("./core/lib/trackExternalLink");

// Keen.utils.domready = require("domready");
// Keen.Spinner = require("spin.js");

Keen.requestHandler = requestHandler;
Keen.utils.extend(Keen.prototype, {
  "trackExternalLink": trackExternalLink
});

module.exports = Keen;
