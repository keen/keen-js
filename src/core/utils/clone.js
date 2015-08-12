var json = require('./json-shim');

module.exports = function(target) {
  return json.parse( json.stringify( target ) );
};
