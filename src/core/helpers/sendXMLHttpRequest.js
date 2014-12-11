var JSON2 = require("JSON2"),
    each = require("../utils/each"),
    getXhr = require("./getXhrObject");

function sendXhr(method, url, headers, body, callback, async){
  var self = this,
      isAsync = async || true,
      cb = callback,
      xhr = getXhr(),
      payload;

  callback = null;

  if (!xhr) {
    self.trigger("error", "XHR requests are not supported");
    return;
  }

  xhr.onreadystatechange = function() {
    var response;
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          response = JSON2.parse(xhr.responseText);
        } catch (e) {
          self.trigger("error", "Could not parse HTTP response: " + xhr.responseText);
          if (cb) {
            cb("Could not parse HTTP response: " + xhr.responseText, null);
            cb = null;
          }
        }
        if (cb && response) {
          cb(null, response);
          cb = null;
        }
      } else {
        self.trigger("error", "HTTP request failed.");
        try {
          response = JSON2.parse(xhr.responseText);
        }
        catch (e) {
          response = void 0;
          if (cb) {
            cb("HTTP request failed.", e);
            cb = null;
          }
        }
        if (cb && response) {
          cb(response, null);
          cb = null;
        }
      }
    }
  };

  xhr.open(method, url, isAsync);

  each(headers, function(value, key){
    xhr.setRequestHeader(key, value);
  });

  if (body) {
    payload = JSON2.stringify(body);
  }

  if (method && method.toUpperCase() === "GET") {
    xhr.send();
  } else if (method && method.toUpperCase() === "POST") {
    xhr.send(payload);
  }

}

module.exports = sendXhr;
