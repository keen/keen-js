var JSON2 = require("JSON2");

module.exports = function(target) {
  return JSON2.parse( JSON2.stringify( target ) );
};
