function _uploadEvent(eventCollection, payload, success, error) {
  var urlBase = this.url("/events/" + eventCollection),
      urlQueryString = "",
      reqType = this.config.requestType,
      data = {};

  // Add properties from client.globalProperties
  if (this.config.globalProperties) {
    data = this.config.globalProperties(eventCollection);
  }

  // Add properties from user-defined event
  _each(payload, function(value, key){
    data[key] = value;
  });

  if (reqType !== "xhr") {
    urlQueryString += "?api_key="  + encodeURIComponent( this.writeKey() );
    urlQueryString += "&data="     + encodeURIComponent( Keen.Base64.encode( JSON.stringify(data) ) );
    urlQueryString += "&modified=" + encodeURIComponent( new Date().getTime() );

    if ( String(urlBase + urlQueryString).length < Keen.urlMaxLength ) {
      if (reqType === "jsonp") {
        _sendJsonp(urlBase + urlQueryString, null, success, error);
      } else {
        _sendBeacon(urlBase + urlQueryString, null, success, error);
      }
      return;
    }
  }
  if (Keen.canXHR) {
    _sendXhr("POST", urlBase, { "Authorization": this.writeKey(), "Content-Type": "application/json" }, data, success, error);
  } else {
    Keen.log("Event not sent: URL length exceeds current browser limit, and XHR (POST) is not supported.");
  }
  return;
};
