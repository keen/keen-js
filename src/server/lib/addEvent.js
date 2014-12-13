var sendEvent = require("../utils/sendEvent");

module.exports = function() {
  sendEvent.apply(this, arguments);
};
