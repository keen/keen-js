var sendEvent = require("../utils/sendEvent");

module.exports = function(collection, payload, callback) {
  var response;
  if (!collection || typeof collection !== "string") {
    response = "Event not recorded: Collection name must be a string";
    this.trigger("error", response);
    if (callback) {
      callback.call(this, response, null);
    }
    return;
  }
  sendEvent.apply(this, arguments);
};
