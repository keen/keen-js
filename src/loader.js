(function(n,c){
  if (typeof(c[n]) === "undefined") {
    c['_'+n] = {};
    c[n] = function(e) {
      c['_'+n][e.projectId] = this;
      this._cf = e;
    }
    c[n].prototype = {
      addEvent: function(e,t,n,i) {
        this._eq = this._eq || [], this._eq.push([e,t,n,i]);
      },
      setGlobalProperties: function(e) {
        this._gp = e;
      }
      //, onChartsReady: function(e) { this._ocrq = this._ocrq || [], this._ocrq.push(e) }
    };
    //window.Keen = Keen;
    //window._KeenCache = {};
    var s = document.createElement("script");
    s.type = "text/javascript", s.async = !0, s.src = "keen.js";
    /*s.onload = s.onreadystatechange = function(){ 
      c[n].sync(c['_'+n]);
      // IE mem leak bug
      s.onload = s.onreadystatechange = null;
    };*/
    var t = document.getElementsByTagName("script")[0];
    t.parentNode.insertBefore(s,t);
  }
})('Keen', this);


/*
var keen = new Keen({
  projectId: "your_project_id",
  writeKey: "your_write_key",
  readKey: "your_read_key"
});
*/