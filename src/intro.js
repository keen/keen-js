!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('Keen', this, function() {
  'use strict';

  /*! 
  * ----------------
  * Keen IO Core JS
  * ----------------
  */

  function Keen(config) {
    return init.apply(this, arguments);
  };

  function init(config) {
    if (config === undefined) return Keen.log('Check out our JavaScript SDK Usage Guide: https://keen.io/docs/clients/javascript/usage-guide/');
    if (config.projectId === undefined) return Keen.log('Please provide a projectId');
    this.configure(config);
  };

  Keen.prototype.configure = function(config){
    this.client = {
      projectId: config.projectId,
      writeKey: config.writeKey,
      readKey: config.readKey,
      globalProperties: null,
      keenUrl: (config.keenUrl) ? config.keenUrl : 'https://api.keen.io/3.0',
      requestType: _setRequestType(config.requestType || 'xhr')
    };
    return this;
  };

