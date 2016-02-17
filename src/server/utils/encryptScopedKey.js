var crypto = require('crypto'),
    json = require('../../core/utils/json-shim');

module.exports = function(apiKey, data) {
  var key, iv, cipher, output;

  key = apiKey.length === 64 ? new Buffer(apiKey, 'hex') : new Buffer(apiKey);
  iv = crypto.randomBytes(16);
  cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  output = iv.toString('hex');
  output += cipher.update(json.stringify(data), 'utf8', 'hex');
  output += cipher.final('hex');

  return output;
};
