(function(i,o){i("Keen","/3.1.0/keen.min.js",o);}(function(t,h,x){
  // t = context
  // h = file
  // x = context
  // console.log(t,h,x===window);
  var methods, script, tag;

  // _Keen cache
  x['_'+t] = {};

  // Keen stub
  x[t] = function(e) {
    x['_'+t].clients = x['_'+t].clients || {};
    x['_'+t].clients[e.projectId] = this;
    this._config = e;
  };

  // Keen.ready(function(){});
  x[t].ready = function(fn){
    x['_'+t].ready = x['_'+t].ready || [];
    x['_'+t].ready.push(fn);
  };

  methods = ['addEvent', 'setGlobalProperties', 'trackExternalLink', 'on'];
  for (var i = 0; i < methods.length; i++){
    var method = methods[i];
    var action = function(method){
      return function() {
        this['_'+method] = this['_'+method] || [];
        this['_'+method].push(arguments);
        return this;
      };
    };
    x[t].prototype[method] = action(method);
  }

  script = document.createElement("script");
  //script.type = "text/javascript";
  script.async = !0;
  script.src = h;

  tag = document.getElementsByTagName("script")[0];
  tag.parentNode.insertBefore(script,tag);

}, this));
