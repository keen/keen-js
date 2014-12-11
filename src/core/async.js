var Keen = require("./index"),
    each = require("./utils/each");

module.exports = function(){
  var loaded = window['Keen'] || null,
      cached = window['_' + 'Keen'] || null,
      clients,
      ready;

  if (loaded && cached) {
    clients = cached['clients'] || {},
    ready = cached['ready'] || [];

    each(clients, function(client, id){

      each(Keen.prototype, function(method, key){
        loaded.prototype[key] = method;
      });

      loaded.Query = (Keen.Query) ? Keen.Query : function(){};
      loaded.Visualization = (Keen.Visualization) ? Keen.Visualization : function(){};

      // Run config
      if (client._config) {
        client.configure.call(client, client._config);
        client._config = undefined;
        try{
          delete client._config;
        }catch(e){}
      }

      // Add Global Properties
      if (client._setGlobalProperties) {
        var globals = client._setGlobalProperties;
        for (var i = 0; i < globals.length; i++) {
          client.setGlobalProperties.apply(client, globals[i]);
        }
        client._setGlobalProperties = undefined;
        try{
          delete client._setGlobalProperties;
        }catch(e){}
      }

      // Send Queued Events
      if (client._addEvent) {
        var queue = client._addEvent || [];
        for (var i = 0; i < queue.length; i++) {
          client.addEvent.apply(client, queue[i]);
        }
        client._addEvent = undefined;
        try{
          delete client._addEvent;
        }catch(e){}
      }

      // Set event listeners
      var callback = client._on || [];
      if (client._on) {
        for (var i = 0; i < callback.length; i++) {
          client.on.apply(client, callback[i]);
        }
        client.trigger('ready');
        client._on = undefined;
        try{
          delete client._on;
        }catch(e){}
      }

    });

    each(ready, function(cb, i){
      Keen.once("ready", cb);
    });
  }
}
