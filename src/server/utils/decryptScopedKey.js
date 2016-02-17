var crypto = require('crypto'),
    json = require('../../core/utils/json-shim');

module.exports = function(apiKey, scopedKey) {
  var key, iv, decipher, cipherText, decoded;

  key = apiKey.length === 64 ? new Buffer(apiKey, 'hex') : new Buffer(apiKey);
  iv = new Buffer(scopedKey.substring(0, 32), 'hex');
  decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  cipherText = new Buffer(scopedKey.substring(32, scopedKey.length), 'hex');

  decoded = decipher.update(cipherText, 'hex', 'utf8');
  decoded += decipher.final('utf8');

  return json.parse(decoded);
};
