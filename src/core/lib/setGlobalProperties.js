Keen.prototype.setGlobalProperties = function(newGlobalProperties) {
  if (newGlobalProperties && typeof(newGlobalProperties) == "function") {
    this.config.globalProperties = newGlobalProperties;
  } else {
    Keen.log('Invalid value for global properties: ' + newGlobalProperties);
  }
};
