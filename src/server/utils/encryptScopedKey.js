var crypto = require("crypto"),
    JSON2 = require("JSON2");

module.exports = function(apiKey, data) {
  // key and iv must be 'binary' encoded strings or buffers.
  var key = new Buffer(apiKey);
  var iv = crypto.randomBytes(16);
  var cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  var output = iv.toString("hex");
      output += cipher.update(JSON2.stringify(data), "utf8", "hex");
      output += cipher.final("hex");

  return output;
};
