module.exports = function(err, res, callback) {
  var cb = callback || function() {};
  if (res && !res.ok && !err) {
    var is_err = res.body && res.body.error_code;
    err = new Error(is_err ? res.body.message : 'Unknown error occurred');
    err.code = is_err ? res.body.error_code : 'UnknownError';
  }
  if (err) return cb(err);
  return cb(null, res.body);
};
