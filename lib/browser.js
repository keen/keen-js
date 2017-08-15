(function(env){
  var KeenLibrary = require('./index.js');
  if (typeof define !== 'undefined' && define.amd) {
    define('keen-js', [], function(){
      return KeenLibrary;
    });
  }
  env.Keen = KeenLibrary;
  // module.exports = KeenLibrary;
}).call(this, typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {});
