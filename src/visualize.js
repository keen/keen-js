  /*!
  * ---------------------
  * Keen IO Visualize JS
  * ---------------------
  */

  // -------------------------------
  // Inject <query>.draw Method
  // -------------------------------

  Keen.Request.prototype.draw = function(selector, config) {
    if (_isUndefined(this.visual) || (config.library !== this.visual.library || config.type !== this.visual.type)) {
      this.visual = new Keen.Visualization(this, selector, config);
    }
    return this;
  };

  // -------------------------------
  // Keen.Visualization
  // -------------------------------

  Keen.Visualization = function(req, selector, config){
    var defaults = {
      library: 'google'
    };
    var options = (config) ? _extend(defaults, config) : defaults;

    if (req.queries[0].params.interval) { // Series
      options.capable = ['areachart', 'barchart', 'columnchart', 'linechart', 'table'];
      if (_isUndefined(options.type)) {
        options.type = 'linechart';
      }
    } else {
      if (req.queries[0].params.group_by) { // Static
        options.capable = ['piechart', 'table'];
        if (_isUndefined(options.type)) {
          options.type = 'piechart';
        }
      } else { // Metric
        options.capable = ['text'];
        if (_isUndefined(options.type)) {
          options.type = 'text';
        }
      }
    }

    // if (options.type && this.capable.indexOf(options.type)) -> request is going to work

    var KeenDatasetConfig = new chartstack.Dataset({
      adapter: "keen-io"
    });
    var KeenViewConfig = {
      el: selector
    };

    if (chartstack.Libraries[options.library]) {
      if (chartstack.Libraries[options.library][options.type]) {
        return new chartstack.Libraries[options.library][options.type]({
          dataset: KeenDatasetConfig,
          view: KeenViewConfig
        })
      } else {
        Keen.log('The visualization type you requested is not available for this library');
      }
    } else {
      Keen.log('The visualization library you requested is not present');
    }

    return this;
  };
