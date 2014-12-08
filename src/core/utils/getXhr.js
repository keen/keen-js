module.exports = function() {
  // yay, superagent!
  var root = "undefined" == typeof window ? this : window;
  if (root.XMLHttpRequest && ("file:" != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch(e) {}
  }
  return false;
};
