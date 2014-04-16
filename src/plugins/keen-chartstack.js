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
      if (!this.visual) {
        this.visual = new Keen.Visualization(this, selector, config);
        this.on("complete", function(){
          this.visual.dataset.responses = [this.data];
          this.visual.dataset.transform();
        })
      }
      return this;
    };

    // -------------------------------
    // Keen.Visualization
    // -------------------------------

    Keen.Visualization = function(req, selector, config){
      var options = (config || {}), recommended;
      var library = chartstack.libraries[options.library] || chartstack.library;

      var datasetConfig = {
        adapter: "keen-io",
        url: req.instance.client.endpoint + '/projects/' + req.instance.client.projectId + req.queries[0].path,
        dateformat: config.dateFormat || "",
        params: req.queries[0].params
        /*
        format: {
          index: { type: 'date', sort: 'desc', format: 'MMM DDD' }
        },
        map: {
          root: "result",
          each: {
            index
          },
          sort: {
            index: 'asc',
            label: 'desc'
          }
        }
        */
      };
      datasetConfig.params.api_key = req.instance.client.readKey;

      var viewConfig = {
        el: selector,
        chartOptions: config.chartOptions || {}
      };



      if (req.queries[0].params.interval) { // Series
        options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
        recommended = 'linechart';
      } else {
        if (req.queries[0].params.group_by) { // Static
          options.capable = ['piechart', 'table'];
          recommended = 'piechart';
        } else { // Metric
          options.capable = ['metric'];
          recommended = 'metric';
        }
      }
      options.chartType = options.chartType || recommended;
      // if (options.chartType && this.capable.indexOf(options.chartType)) -> request is going to work

      if (options.chartType == 'metric') {
        library = 'widgets';
        // return new Keen.Number(selector, config);
        // return new chartstack.Widgets.Number({ });
      }

      if (library) {
        if (chartstack.libraries[library][options.chartType]) {
          return new chartstack.Chart({
            dataset: new chartstack.Dataset(datasetConfig),
            view: new chartstack.libraries[library][options.chartType](viewConfig)
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
