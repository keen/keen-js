var uploadEvent = require("../utils/uploadEvent");
module.exports = function(eventCollection, payload, success, error) {
  var response;
  if (!eventCollection || typeof eventCollection !== "string") {
    response = "Event not recorded: Collection name must be a string";
    this.trigger("error", response);
    if (error) {
      error.call(this, response);
    }
    return;
  }
  uploadEvent.apply(this, arguments);
};
