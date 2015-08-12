var crypto = require('crypto'),
    json = require('../../core/utils/json-shim');

module.exports = function(apiKey, scopedKey) {
  // key and iv must be 'binary' encoded strings or buffers.
  var key = new Buffer(apiKey);
  var iv = new Buffer(scopedKey.substring(0, 32), 'hex');
  var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  var cipherText = new Buffer(scopedKey.substring(32, scopedKey.length), 'hex');

  var decoded = decipher.update(cipherText, 'hex', 'utf8');
      decoded += decipher.final('utf8');

  return json.parse(decoded);
};
