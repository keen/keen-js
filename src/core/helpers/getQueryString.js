var JSON2 = require("JSON2");

module.exports = function(params){
  var query = [];
  for (var key in params) {
    if (params[key]) {
      var value = params[key];
      if (Object.prototype.toString.call(value) !== '[object String]') {
        value = JSON2.stringify(value);
      }
      value = encodeURIComponent(value);
      query.push(key + '=' + value);
    }
  }
  return "?" + query.join('&');
};
