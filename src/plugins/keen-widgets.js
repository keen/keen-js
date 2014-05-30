/*!
* ----------------------
* Keen IO Plugin
* Data Visualization
* ----------------------
*/

!function(name, context){
  var Keen = context[name] || {},
      Metric;

  Metric = Keen.Visualization.extend({
    initialize: function(){
      var css = document.createElement("style"),
          bgColor = (this.colors.length > 1) ? this.colors[1] : this.colors[0];

      css.id = "cs-styles-keen-io";
      css.type = "text/css";
      css.innerHTML = "\
.cs-widget { \n  background: " + bgColor + "; \n  border-radius: 4px; \n  color: #fff; \n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; \n  padding: 10px 0; \n  text-align: center; \n} \
.cs-widget-value { \n  display: block; \n  font-size: 84px; \n  font-weight: 700; \n  line-height: 84px; \n} \
.cs-widget-title { \n  display: block; \n  font-size: 24px; \n  font-weight: 200; \n}";
      if (!document.getElementById("cs-styles-keen-io")) {
        document.body.appendChild(css);
      }
      this.render();
    },
    render: function(){
      this.el.innerHTML = '' +
        '<div class="cs-widget cs-number" style="width:' + parseInt(this.width) + 'px;">' +
        '<span class="cs-widget-value">' + this.data.table[1] + '</span>' +
        '<span class="cs-widget-title">' + (this.title || 'Result') + '</span>' +
        '</div>';
    }
  });

  Keen.Visualization.register('keen-io', {
    'metric': Metric
  });

}('Keen', this);
