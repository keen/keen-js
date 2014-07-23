/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

!function(name, context, definition){
  if (typeof define == "function" && define.amd) {
    define(["keen"], function(lib){
      definition(lib);
    });
  }
  if (typeof module != "undefined" && module.exports) {
    module.exports = definition();
  }
  if (context[name]){
    definition(context[name]);
  }

}("Keen", this, function(lib) {
  "use strict";

  var Keen = lib || {};
  Keen.Visualization.register('test', {
    'chart': function(){}
  });

});
