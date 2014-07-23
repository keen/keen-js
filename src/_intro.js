!function(name, context, definition){
  if (typeof define == "function" && define.amd) {
    // Register ID to avoid anonymous define() errors
    define("keen", [], function(){
      return definition();
    });
  }
  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = definition();
  } else {
    context[name] = definition();
  }

}("Keen", this, function(){
  "use strict";
