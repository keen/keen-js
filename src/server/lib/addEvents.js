var sendEvents = require("../utils/sendEvents");

module.exports = function() {
  sendEvents.apply(this, arguments);
};
