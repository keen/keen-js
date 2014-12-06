module.exports = function(target) {
  return JSON.parse( JSON.stringify( target ) );
};
