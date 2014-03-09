  /*! 
  * ----------------------
  * Keen IO Plugin
  * Auto Pageview Tracker
  * ----------------------
  */
	
	var AutoTracking = Keen.Plugins.AutoPageviewTracking = {
    configure: function(instance, configuration){
      var client = (instance instanceof Keen) ? instance : false,
          config = configuration['pageviews'] || false,
          defaults, options, override_addons;
          
      if (!client || (_type(config) !== 'Object' && _type(config) !== 'Boolean')) {
        return; // Configuration error somewhere upstream
      }
      
      defaults = {
        collection: 'pageview',
        params: ['utm_content', 'utm_source', 'utm_medium', 'utm_term', 'utm_campaign'],
        ip_to_geo: false,
        ua_parser: false,
        data: {
          referrer: document.referrer,
          page: {
            title: document.title,
            host: document.location.host,
            href: document.location.href,
            path: document.location.pathname,
            protocol: document.location.protocol.replace(/:/g, ''),
            query: document.location.search
          }
        }
      };
      
      config = (typeof config !== 'undefined' && config !== null & _type(config) == 'Object') ? config : false;
      config['data'] = (typeof config['data'] !== 'undefined' && config['data'] !== null && _type(config['data']) == 'Object') ? config['data'] : false;

      if (config) {
        if (config['data']) {
          defaults['data'] = config['data'];
        } else {
          config['data'] = defaults['data'];
        }
        options = _extend(defaults, config);
      } else {
        options = defaults;
      }
      
      // Get values for whitelisted params
      // ----------------------------------
      for (var i = 0; i < options['params'].length; i++) {
        var match = RegExp('[?&]' + options['params'][i] + '=([^&]*)').exec(document.location.search);
        var result = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        if (result !== null) {
          options['data'][options['params'][i]] = result;
        }
      }
      
      // Set keen.timestamp if it doesn't exist
      // ---------------------------------------
      options['data']['keen'] = options['data']['keen'] || {};
      options['data']['keen']['timestamp'] = options['data']['keen']['timestamp'] || new Date().toISOString();
      
      // Configure add-ons
      // ----------------------------------
      override_addons = (options['data']['keen']['addons']) ? true : false; 
      
      // Configure Addons
      // ----------------------------------
      if (!override_addons) {
        _configure_addon(options['ip_to_geo'], 'keen:ip_to_geo', 'ip', '${keen.ip}');
        _configure_addon(options['ua_parser'], 'keen:ua_parser', 'ua_string', '${keen.user_agent}');
      }
      
      function _configure_addon(property, name, inputKey, placeholder) {
        if (!property || _type(property) !== 'Object') {
          return;
        }
        var input = property['input'],
            output = property['output'],
            addon = { name: name, input: {}, output: output };
        
        options['data'][input] = options['data'][input] || placeholder;
        
        if (input && output) {
          options['data']['keen']['addons'] = options['data']['keen']['addons'] || [];
          addon['input'][inputKey] = input;
          options['data']['keen']['addons'].push(addon);
        } else {
          throw new Error('Addon ' + name + ' requires both input and output properties');
        }
      };
      
      // Send pageview event
      // ----------------------------------
      //console.log('data', options['data']);
      client.addEvent(options['collection'], options['data']);
    }
  }
  
  Keen.on('client:config', function(response){
    Keen.Plugins.AutoPageviewTracking.configure.apply(this, arguments);
  });
  