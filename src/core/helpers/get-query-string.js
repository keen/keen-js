var each = require('../utils/each'),
    json = require('../utils/json-shim');

module.exports = function(params){
  var query = [];
  each(params, function(value, key){
    // if (Object.prototype.toString.call(value) !== '[object String]') {}
    if ('string' !== typeof value) {
      value = json.stringify(value);
    }
    query.push(key + '=' + encodeURIComponent(value));
  });
  return '?' + query.join('&');
};
