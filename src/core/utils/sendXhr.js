var each = require("./each"),
    getXhr = require("./getXhr"),
    JSON2 = require("JSON2");

function sendXhr(method, url, headers, body, success, error, async){
  var isAsync = async || true,
      successCallback = success,
      errorCallback = error,
      xhr = getXhr(),
      payload;

  success = error = null;

  if (!xhr) {
    this.trigger("error", "XHR requests are not supported");
    return;
  }

  xhr.onreadystatechange = function() {
    var response;
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          response = JSON2.parse(xhr.responseText);
        } catch (e) {
          this.trigger("error", "Could not parse HTTP response: " + xhr.responseText);
          if (errorCallback) {
            errorCallback(xhr, e);
            successCallback = errorCallback = null;
          }
        }
        if (successCallback && response) {
          successCallback(response);
          successCallback = errorCallback = null;
        }
      } else {
        this.trigger("error", "HTTP request failed.");
        try {
          response = JSON2.parse(xhr.responseText);
        }
        catch (e) {
          response = null;
          if (errorCallback) {
            errorCallback(xhr, e);
            successCallback = errorCallback = null;
          }
        }
        if (errorCallback && response) {
          errorCallback(xhr, response);
          successCallback = errorCallback = null;
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
