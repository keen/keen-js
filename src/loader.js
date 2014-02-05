if (typeof(Keen) === "undefined") {
  Keen = function(e) {
    _KeenCache[e.projectId] = this;
    this._cf = e;
  }
  Keen.prototype = {
    addEvent: function(e,t,n,i) {
      this._eq = this._eq || [], this._eq.push([e,t,n,i]);
    },
    setGlobalProperties: function(e) {
      this._gp = e;
    }
    //, onChartsReady: function(e) { this._ocrq = this._ocrq || [], this._ocrq.push(e) }
  };
  window.Keen = Keen;
  window._KeenCache = {};
}

(function(){
  var e = document.createElement("script");
  e.type = "text/javascript", e.async = !0, e.src = "keen.js";
  var t = document.getElementsByTagName("script")[0];
  t.parentNode.insertBefore(e, t);
})();

var keen = new Keen({
  projectId: "your_project_id",
  writeKey: "your_write_key",
  readKey: "your_read_key"
});