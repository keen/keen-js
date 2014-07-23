!function(name, context, definition){
  if (typeof define == "function" && define.amd) {
    define(["keen"], function(lib){
      definition(lib);
    });
  }

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = definition();
  } else {
    definition(context[name]);
  }

}("Keen", this, function(Keen) {
  "use strict";
