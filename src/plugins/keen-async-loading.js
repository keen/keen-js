  /*! 
  * ----------------------
  * Keen IO Plugin
  * Async Loader
  * ----------------------
  */
  
  var AsyncLoading = Keen.Plugins.AsyncLoading = function(){
    var cache = window['_' + 'Keen'] || false;
    if (cache) {
      var clients = cache['clients'] || {};
      var ready = cache['ready'] || [];

      for (var instance in clients) {
        if (clients.hasOwnProperty(instance)) {
          var client = clients[instance];
          //console.log(client);

          // Map methods to existing instances
          for (var method in Keen.prototype) {
            if (Keen.prototype.hasOwnProperty(method)) {
              window.Keen.prototype[method] = Keen.prototype[method];
            }
          }

          // Map additional methods as necessary
          var analyses = ['Analysis', 'Count', 'CountUnique', 'Sum', 'Average', 'Minimum', 'Maximum', 'SelectUnique', 'Extraction', 'Funnel'];
          for (var i = 0; i < analyses.length; i++) {
            window.Keen[analyses[i]] = (Keen.Query) ? Keen[analyses[i]] : function(){ throw new Error('Keen.' + analyses[i] + ' is not available in this version of the library.') };
          }
          
          // Run Configuration
          if (client._config) {
            client.configure(client._config);
            delete client._config;
          }

          // Add Global Properties
          if (client._setGlobalProperties) {
            var globals = client._setGlobalProperties;
            for (var i = 0; i < globals.length; i++) {
              client.setGlobalProperties.apply(client, globals[i]);
            }
            delete client._setGlobalProperties;
          }

          // Send Queued Events
          if (client._addEvent) {
            var queue = client._addEvent || [];
            for (var i = 0; i < queue.length; i++) {
              client.addEvent.apply(client, queue[i]);
            }
            delete client._addEvent;
          }

          // Create "on" Events
          var callback = client._on || [];
          if (client._on) {
            for (var i = 0; i < callback.length; i++) {
              client.on.apply(client, callback[i]);
            }
            client.trigger('ready');
            delete client._on;
          }
        }
      }

      for (var i = 0; i < ready.length; i++) {
        var callback = ready[i];
        Keen.on('ready', function(){
          callback();
        });
      };

    }
  };

  Keen.on('ready', function(response){
    Keen.Plugins.AsyncLoading();
  });
  