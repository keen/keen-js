function _sendXhr(method, url, headers, body, success, error){
  var ids = ['MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'],
      successCallback = success,
      errorCallback = error,
      payload,
      xhr;

  success = null;
  error = null;

  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  }
  else {
    // Legacy IE support: look up alts if XMLHttpRequest is not available
    for (var i = 0; i < ids.length; i++) {
      try {
        xhr = new ActiveXObject(ids[i]);
        break;
      } catch(e) {}
    }
  }

  xhr.onreadystatechange = function() {
    var response;
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          Keen.log("Could not parse HTTP response: " + xhr.responseText);
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
        Keen.log("HTTP request failed.");
        if (errorCallback) {
          errorCallback(xhr, null);
          successCallback = errorCallback = null;
        }
      }
    }
  };

  xhr.open(method, url, true);

  _each(headers, function(value, key){
    xhr.setRequestHeader(key, value);
  });

  if (body) {
    payload = JSON.stringify(body);
  }

  if (method && method.toUpperCase() === "GET") {
    xhr.send();
  } else if (method && method.toUpperCase() === "POST") {
    xhr.send(payload);
  }

}
