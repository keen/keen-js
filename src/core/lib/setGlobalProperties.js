var Keen = require("../index");

module.exports = function(newGlobalProperties) {
  if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
    this.config.globalProperties = newGlobalProperties;
  } else {
    this.trigger("error", "Invalid value for global properties: " + newGlobalProperties);
    // Keen.log('Invalid value for global properties: ' + newGlobalProperties);
  }
};
