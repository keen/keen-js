/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

!function(name, context, definition){

  if (typeof define == 'function' && define.amd) {
    define(['../core'], function(Keen){
      return definition(Keen);
    });
  }
  else if (typeof module != 'undefined' && module.exports) {
    module.exports = definition();
  }
  else {
    context[name] = definition(context);
  }

}("Keen", this, function(lib) {
  'use strict';

  var Keen = lib || {},
      Metric;

  Metric = Keen.Visualization.extend({
    initialize: function(){
      var css = document.createElement("style"),
          bgDefault = "#49c5b1";

      css.id = "keen-widgets";
      css.type = "text/css";
      css.innerHTML = "\
.keen-metric { \n  background: " + bgDefault + "; \n  border-radius: 4px; \n  color: #fff; \n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; \n  padding: 10px 0; \n  text-align: center; \n} \
.keen-metric-value { \n  display: block; \n  font-size: 84px; \n  font-weight: 700; \n  line-height: 84px; \n} \
.keen-metric-title { \n  display: block; \n  font-size: 24px; \n  font-weight: 200; \n}";
      if (!document.getElementById(css.id)) {
        document.body.appendChild(css);
      }
      this.render();
    },

    render: function(){
      var bgColor = (this.colors.length == 1) ? this.colors[0] : "#49c5b1",
          prefix = "",
          suffix = "",
          title = this.title || "Result",
          value = this.data.table[1],
          width = parseInt(this.width);

      if (this.chartOptions['prefix']) {
        prefix = '<span class="keen-metric-prefix">' + this.chartOptions['prefix'] + '</span>';
      }
      if (this.chartOptions['suffix']) {
        suffix = '<span class="keen-metric-suffix">' + this.chartOptions['suffix'] + '</span>';
      }

      this.el.innerHTML = '' +
        '<div class="keen-widget keen-metric" style="background-color: ' + bgColor + '; width:' + width + 'px;">' +
          '<span class="keen-metric-value">' + prefix + value + suffix + '</span>' +
          '<span class="keen-metric-title">' + title + '</span>' +
        '</div>';
    }
  });

  Keen.Visualization.register('keen-io', {
    'metric': Metric
  });

  return Keen;
});
