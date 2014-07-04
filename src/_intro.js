!function(name, context, factory){

  if (typeof module != 'undefined' && module.exports) {
    module.exports = factory();
  }
  else if (typeof define == 'function' && define.amd) {
    define([
      'keen/lib/dataform',
      'keen/lib/domready',
      'keen/lib/spinner'
    ], function(Dataform, domready, Spinner){
      var Keen = factory();
      Keen.Dataform = Dataform;
      Keen.utils.domready = domready;
      Keen.Spinner = Spinner;
      return Keen;
    });
  }
  else {
    context[name] = factory();
  }
}('Keen', this, function(){
  'use strict';

/*

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) {
    module.exports = definition();
  }
  else if (typeof define == 'function' && define.amd) {
    define(definition);
  }
  else {
    context[name] = definition();
  }
}('Keen', this, function() {
  'use strict';

*/
