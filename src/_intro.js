!function(name, context, definition){
  if (typeof define == "function" && define.amd) {
    define(definition);
  }
  if (typeof module != "undefined" && module.exports) {
    module.exports = definition();
  }
  context[name] = definition();
}("Keen", this, function(){
  "use strict";
