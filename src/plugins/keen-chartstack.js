  /*!
  * ----------------------
  * Keen IO + Chartstack
  * ----------------------
  */


  !function(name, context){
    var Keen = context[name] || {};
    /*var cs = context.chartstack;
    Keen.chartstack = cs.noConflict();
    Keen.Chart = function(obj){
      return new Keen.chartstack.Chart(obj);
    };
    // Keen.ready = cs.ready;*/

    // -------------------------------
    // Inject <query>.draw Method
    // -------------------------------

    Keen.Request.prototype.draw = function(selector, config) {
      if (void 0 == this.visual || (config.library !== this.visual.library || config.type !== this.visual.type)) {
        this.visual = new Keen.Visualization(this, selector, config);
      }
      return this;
    };

    // -------------------------------
    // Keen.Visualization
    // -------------------------------

    Keen.Visualization = function(req, selector, config){
      var options = (config || {});

      if (req.queries[0].params.interval) { // Series
        options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
        if (void 0 == options.chartType) {
          options.chartType = 'linechart';
        }
      } else {
        if (req.queries[0].params.group_by) { // Static
          options.capable = ['piechart', 'table'];
          if (void 0 == options.chartType) {
            options.chartType = 'piechart';
          }
        } else { // Metric
          options.capable = ['text'];
          if (void 0 == options.chartType) {
            options.chartType = 'text';
          }
        }
      }

      // if (options.chartType && this.capable.indexOf(options.chartType)) -> request is going to work

      var KeenDatasetConfig = {
        adapter: "keen-io",
        url: req.instance.client.endpoint + '/projects/' + req.instance.client.projectId + req.queries[0].path,
        dateformat: config.dateFormat || "",
        params: req.queries[0].params
      };
      chartstack.extend(KeenDatasetConfig.params, {
        api_key: req.instance.client.readKey
      })

      var KeenViewConfig = {
        el: document.getElementById("chart"),
        title: config.title || "",
        height: config.height || 300,
        width: config.width,
        options: config.chartOptions || {}
      };

      if (chartstack.Libraries[options.library]) {
        if (chartstack.Libraries[options.library][options.chartType]) {

          return new chartstack.Chart({
            dataset: new chartstack.Dataset(KeenDatasetConfig),
            view: new chartstack.Libraries[options.library][options.chartType](KeenViewConfig)
          })

        } else {
          Keen.log('The visualization type you requested is not available for this library');
        }
      } else {
        Keen.log('The visualization library you requested is not present');
      }

      return this;
    };


  }('Keen', this);
