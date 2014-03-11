
  // ----------------------
  // Handle Queued Commands
  // -------------------------------

  for (var instance in window._KeenCache) {
    if (window._KeenCache.hasOwnProperty(instance)) {
      // console.log(window._KeenCache[instance]);
      var client = window._KeenCache[instance];
    
      for (var method in Keen.prototype) {
        if (Keen.prototype.hasOwnProperty(method)) {
          window.Keen.prototype[method] = Keen.prototype[method];
        }
      }
    
      // Configuration
      if (client._cf) {
        client.configure(client._cf);
      }
    
      // Global Properties (test!)
      if (client._gp) {
        client.setGlobalProperties(client._gp);
      }
    
      // Queued Events
      var queue = client._eq;
      if (queue && queue.length > 0) {
        for (var i=0; i < queue.length; i++) {
          var eventCollection = queue[i].shift();
          var payload = queue[i].shift();
          var success = queue[i].shift();
          var error = queue[i].shift();
          client.addEvent(eventCollection, payload, success, error);
        }
      }
    
      // onChartsReady Callbacks (test!)
      var callback = client._ocrq;
      if (callback && callback.length > 0) {
        for (var i=0; i < callack.length; i++) {
          var handler = callback[i];
          Keen.onChartsReady(handler);
        }
      }
    
    }
  }


  // ----------------------
  // Utility Methods
  // ----------------------

  Keen.log = function(message) {
    console.log('[Keen IO]', message)
  };

  return Keen;
});