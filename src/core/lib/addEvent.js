// ../utils/uploadEvent.js

Keen.prototype.addEvent = function(eventCollection, payload, success, error) {
  var response;
  if (!eventCollection || typeof eventCollection !== "string") {
    response = "Event not recorded: Collection name must be a string";
    Keen.log(response);
    if (error) error.call(this, response);
    return;
  }
  _uploadEvent.apply(this, arguments);
};
