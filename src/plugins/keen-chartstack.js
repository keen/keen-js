  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  !function(name, context){
    var Keen = context[name] || {};
    var cs = context.chartstack;
    Keen.vis = cs; //.noConflict();
    Keen.Chart = function(obj){
      return new Keen.vis.Chart(obj);
    };
    //Keen.ready = Keen.vis.ready;
    Keen.vis.addAdapter('default', Keen.vis.adapters['keen-io']);

    Keen.vis.defaults = Keen.vis.defaults || {};
    Keen.vis.defaults.height = 400;
    Keen.vis.defaults.width = 600;
    Keen.vis.defaults.colors = [
      '#00afd7', // blue
      '#49c5b1', // green
      '#e6b449', // gold
      '#f35757'  // red
    ];

    // -------------------------------
    // Inject Draw Methods
    // -------------------------------

    /*Keen.prototype.draw = function(query, selector, config) {
      return new Keen.Request(this, [query], function(){
        this.draw(selector, config);
      });
      //return new Keen.Visualization(stub, selector, config);
    };*/

    Keen.Request.prototype.draw = function(selector, config) {
      var self = this;
      if (!self.visual) {
        self.visual = new Keen.Visualization(self, selector, config);
      }
      return self;
    };

    // -------------------------------
    // Keen.Visualization
    // -------------------------------

    Keen.Visualization = function(req, selector, config){
      var self = this, options = (config || {}), recommended;
      var library = Keen.vis.libraries[options.library] || Keen.vis.library;

      // Configure Dataset
      // -------------------------------
      var datasetConfig = {
        adapter: "keen-io",
        url: req.instance.client.endpoint + '/projects/' + req.instance.client.projectId + req.queries[0].path,
        params: req.queries[0].params,
        dateformat: options.dateFormat || ""
      };
      datasetConfig.params.api_key = req.instance.client.readKey;

      // Trigger Dataset request if not
      // built from #draw/#run methods
      // -------------------------------
      if (req.data !== void 0) {
        datasetConfig.response = req.data;
      }

      // Configure View
      // -------------------------------
      var viewConfig = Keen.vis.extend({
        el: selector,
        chartOptions: {}
      }, options);

      viewConfig.chartOptions.colors = viewConfig.chartOptions.colors || Keen.vis.defaults.colors;

      // Select a default chart type
      // -------------------------------
      if (req.queries[0].params.interval) { // Series
        options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
        recommended = 'linechart';
      } else {
        if (req.queries[0].params.group_by) { // Static
          options.capable = ['piechart', 'barchart', 'columnchart', 'table'];
          recommended = 'barchart';
        } else { // Metric
          options.capable = ['metric'];
          recommended = 'metric';
        }
      }

      // Custom Dataset schema for
      // complex query/response types
      // -------------------------------

      // 2x GroupBy
      if (req.queries[0].params.group_by instanceof Array) {
        options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
        recommended = 'columnchart';
        datasetConfig.map = {
          root: 'result',
          //each: {},
          sort: {
            index: 'asc',
            label: 'desc'
          }
        };
        if (req.queries[0].params.interval) {
          datasetConfig.map.each = {
            label: 'value -> ' + req.queries[0].params.group_by[0],
            index: 'timeframe -> start',
            value: 'value -> result'
          };
        } else {
          datasetConfig.map.each = {
            label: req.queries[0].params.group_by[1],
            index: req.queries[0].params.group_by[0],
            value: 'result'
          };
        }
      }

      // Funnels
      if (req.queries[0].params.steps) {
        options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
        recommended = 'columnchart';
      }

      // Set default view attributes
      // -------------------------------
      options.chartType = options.chartType || recommended;

      // if (viewConfig.title == void 0) {}
      viewConfig.title = viewConfig.title || (function(){
        var output = req.queries[0].analysis.toUpperCase();
        if (req.queries[0].get('event_collection') !== null) {
          output += ': ' + req.queries[0].get('event_collection').toUpperCase();
        }
        return output;
      })();

      if (options.chartType == 'metric') {
        library = 'keen-io';
      }

      // Put it all together
      // -------------------------------
      if (library) {
        if (Keen.vis.libraries[library][options.chartType]) {
          return new Keen.Chart({
            dataset: new Keen.vis.Dataset(datasetConfig),
            view: new Keen.vis.libraries[library][options.chartType](viewConfig)
          })

        } else {
          Keen.log('The visualization type you requested is not available for this library');
        }
      } else {
        //console.log(req.queries[0].params.group_by instanceof Array);
        Keen.log('The visualization library you requested is not present');
      }

      return this;
    };

    Keen.vis.ready(function(){
      Keen.trigger('ready');
    });

  }('Keen', this);
