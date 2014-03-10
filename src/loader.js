(function(n,c){
  if (c[n] === void 0) {
    
    c['_'+n] = {};
    c[n] = function(e) {
      c['_'+n][e.projectId] = this;
      this._cf = e;
    };
    
    c[n].prototype = {
      addEvent: function(e,t,n,i) {
        this._eq = this._eq || [], this._eq.push([e,t,n,i]);
      },
      setGlobalProperties: function(e) {
        this._gp = e;
      },
      on: function(ev, cb) {
        this._on = this._on || [], this._on.push([ev,cb]);
      }
    };
    
    var s = document.createElement("script");
    s.type = "text/javascript", s.async = !0, s.src = "keen-3.0.0.min.js";
    
    var t = document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(s,t);
  }
})('Keen', this);