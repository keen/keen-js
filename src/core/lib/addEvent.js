var sendEvent = require("../utils/sendEvent");

module.exports = function(collection, payload, success, error) {
  var response;
  if (!collection || typeof collection !== "string") {
    response = "Event not recorded: Collection name must be a string";
    this.trigger("error", response);
    if (error) {
      error.call(this, response);
    }
    return;
  }
  sendEvent.apply(this, arguments);
};
