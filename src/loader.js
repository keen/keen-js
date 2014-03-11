(function(n,c){
  if (c[n] === void 0) {
    
    c['_'+n] = {};
    c[n] = function(e) {
      c['_'+n]['clients'] = c['_'+n]['clients'] || {};
      c['_'+n]['clients'][e.projectId] = this;
      this._config = e;
    };
    
    // Keen.ready(function(){});
    c[n]['ready'] = function(callback){
      c['_'+n]['ready'] = c['_'+n]['ready'] || [];
      c['_'+n]['ready'].push(callback);
    };
    
    var methods = ['addEvent', 'setGlobalProperties', 'trackExternalLink', 'on'];
    for (var i = 0; i < methods.length; i++){
      var method = methods[i];
      var action = function(method){
        return function() {
          this['_'+method] = this['_'+method] || [];
          this['_'+method].push(arguments);
          return this;
        }
      };
      c[n].prototype[method] = action(method);
    }
    
    var s = document.createElement("script");
    s.type = "text/javascript", s.async = !0, s.src = "keen-3.0.0.min.js";
    
    var t = document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(s,t);
  }
})('Keen', this);