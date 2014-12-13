var sendEvents = require("../utils/sendEvents");

module.exports = function(payload, callback) {
  var response;
  if (arguments.length > 2) {
    response = "Events not recorded: Incorrect arguments provided to #addEvents method";
    this.trigger("error", response);
    if (typeof arguments[2] === "function") {
      arguments[2].call(this, response, null);
    }
    return;
  }
  if (typeof payload !== "object" || payload instanceof Array) {
    response = "Events not recorded: Request payload must be an object";
    this.trigger("error", response);
    if (callback) {
      callback.call(this, response, null);
    }
    return;
  }
  sendEvents.apply(this, arguments);
};
