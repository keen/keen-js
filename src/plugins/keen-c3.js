  /*!
  * ----------------------
  * Keen IO Plugin
  * Data Visualization
  * ----------------------
  */

  (function(lib){
    var Keen = lib || {};

    /**
     * Unpacks the data from dataform's table. Basically, it takes the table and rotates it
     * 90 degrees.
     * @param  {[2D array]} table [the dataform 2d array]
     * @return {[2D array]}       [the resulting array that is compatible with C3's column structure]
     */
    var _unpack = function(table, chartType) {
      var plucked = [];
      var isNonDate = chartType === 'pie' || chartType === 'donut';
      var numberOfColumns = table[0].length;
      var start = isNonDate ? 1 : 0;

      // Construct new table
      for(var x = 0; x < numberOfColumns; x++) {
        plucked.push([]);
      }

      // Build new table that is compatible with c3.
      // The first item in the table will be the names
      for(var i = 0; i < table.length; i++) {
        for(var j = start; j < numberOfColumns; j++) {
          plucked[j].push(table[i][j]);
        }
      }
      return plucked;
    };

    /**
     * Handler for determining what the x-axis will display
     * @return {object}/undefined
     */
    var handleTimeseries = function() {
      var candidates = this.data.c3;
      // if the first itemset is a date, then make it into a timeseries
      if(candidates[0][1] instanceof Date) {
        return {
          x: {
            type: 'timeseries',
            tick: {
              fit: true
            }
          }
        };
      }
    };

    var registerColors = function() {
      var colors = {};
      //TODO set colors as an alternative
      for(var i = 1; i < this.data.c3.length; i++) {
        var set = this.data.c3[i];
        colors[set[0]] = this.colors[i - 1];
      }
      return colors;
    };

    var chartTypes = [];
    var dataTypes = {
      // dataType              chartTypes (namespace)
      'singular':              ['gauge'],
      'categorical':           ['donut', 'pie']
      // 'cat-interval':       ['columnchart', 'barchart', 'table'],
      // 'cat-ordinal':        ['barchart', 'columnchart', 'areachart', 'linechart', 'table'],
      // 'chronological':      ['areachart', 'linechart', 'table'],
      // 'cat-chronological':  ['linechart', 'columnchart', 'barchart', 'areachart'],
      // 'nominal':            ['table'],
      // 'extraction':         ['table']
    };

    var charts = {};

    charts['gauge'] = {
      render: function(){
        var setup = {
          bindto: this.el(),
          data: {
            columns: []
          },

          color: {
            pattern: this.colors()
          },
          size: {
            height: this.height(),
            width: this.width()
          }

          // chartOptions:
          // -------------
          // axis: {}
          // color: {}    <-- be aware: we set values here
          // grid: {}
          // legend: {}
          // point: {}
          // regions: {}
          // size: {}     <-- be aware: we set values here
          // tooltip: {}
          // zoom: {}

          // line, pie, donut etc...
        };
        setup['data']['type'] = "gauge"; // {type}
        this.view._artifacts["c3"] = this.view._artifacts["c3"] || c3.generate(setup);
        this.update();
      },
      update: function(){
        this.view._artifacts["c3"].load({
          columns: [
            [this.title(), this.data()[1][1]]
          ]
        })
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };


    charts["donut"] = {
      render: function(){
        var setup = {
          bindto: this.el(),
          data: {
            columns: []
          },

          color: {
            pattern: this.colors()
          },
          size: {
            height: this.height(),
            width: this.width()
          }

          // chartOptions:
          // -------------
          // axis: {}
          // color: {}    <-- be aware: we set values here
          // grid: {}
          // legend: {}
          // point: {}
          // regions: {}
          // size: {}     <-- be aware: we set values here
          // tooltip: {}
          // zoom: {}

          // line, pie, donut etc...
        };
        setup['data']['type'] = "donut"; // {type}
        setup["donut"] = {
          title: this.title()
        };
        this.view._artifacts["c3"] = this.view._artifacts["c3"] || c3.generate(setup);
        this.update();
      },
      update: function(){
        this.view._artifacts["c3"].load({
          columns: this.dataset.data.output.slice(1)
        });
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };

    charts["pie"] = {
      render: function(){
        var setup = {
          bindto: this.el(),
          data: {
            columns: []
          },

          color: {
            pattern: this.colors()
          },
          size: {
            height: this.height(),
            width: this.width()
          }

          // chartOptions:
          // -------------
          // axis: {}
          // color: {}    <-- be aware: we set values here
          // grid: {}
          // legend: {}
          // point: {}
          // regions: {}
          // size: {}     <-- be aware: we set values here
          // tooltip: {}
          // zoom: {}

          // line, pie, donut etc...
        };
        setup['data']['type'] = "pie"; // {type}
        setup["pie"] = {
          title: this.title()
        };
        this.view._artifacts["c3"] = this.view._artifacts["c3"] || c3.generate(setup);
        this.update();
      },
      update: function(){
        this.view._artifacts["c3"].load({
          columns: this.dataset.data.output.slice(1)
        });
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };


    function _selfDestruct(){
      if (this.view._artifacts["c3"]) {
        this.view._artifacts["c3"].destroy();
        this.view._artifacts["c3"] = null;
      }
    }

    // Create chart types
    // -------------------------------
    _each(chartTypes, function (chart) {
      // console.log(key, chart);
      charts[chart] = {
        initialize: function(){
          this.data.c3 = _unpack(this.data.table, chart);
          //this.render();
        },
        render: function(){
          var self = this;
          var data = {};

          if(chart !== 'pie') {
            data.x = this.data.c3[0][0];
          }

          _extend(data, {
            columns: this.data.c3,
            colors: registerColors.call(this),
            type: chart
          });

          // Binding and defaulting
          var options = {
            bindto: self.el,
            size: {
              width: this.width,
              height: this.height,
            },
            grid: {
              x: {
                show: true
              },
              y: {
                show: true
              }
            },
            data: data,
            axis: handleTimeseries.apply(this)
          };

          _extend(options, this.chartOptions);

          // Make chart
          self._chart = c3.generate(options);
        },
        update: function(){
          var unpacked = _unpack(this.data.table);
          this._chart.load({
            columns: unpacked
          });
        },
        destroy: function(){
          //handleRemoval.call(this);
        }
      };

    });

    // Register library + add dependencies + types
    // -------------------------------
    Keen.Dataviz.register('c3', charts, {
      capabilities: dataTypes
      // dependencies: [
      //   {
      //     type: 'script',
      //     url: 'http://cdnjs.cloudflare.com/ajax/libs/d3/3.4.11/d3.min.js'
      //   },
      //   {
      //     type: 'script',
      //     url: 'http://c3js.org/js/c3.min-b4e07444.js'
      //   },
      //   {
      //     type: 'style',
      //     url: 'http://c3js.org/css/c3-f750e4d4.css'
      //   }
      // ]
    });

  })(Keen);
