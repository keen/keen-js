var each = require('../utils/each'),
    JSON2 = require('JSON2');

module.exports = function(params){
  var query = [];
  each(params, function(value, key){
    // if (Object.prototype.toString.call(value) !== '[object String]') {}
    if ('string' !== typeof value) {
      value = JSON2.stringify(value);
    }
    query.push(key + '=' + encodeURIComponent(value));
  });
  return '?' + query.join('&');
};
