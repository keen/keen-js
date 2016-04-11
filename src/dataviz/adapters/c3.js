/*!
 * ----------------------
 * C3.js Adapter
 * ----------------------
 */

var Dataviz = require('../dataviz'),
    each = require('../../core/utils/each'),
    extend = require('../../core/utils/extend');
    getSetupTemplate = require('./c3/get-setup-template')

module.exports = function(){

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

  var dataTypes = {
    // dataType            : // chartTypes
    'singular'             : ['gauge'],
    'categorical'          : ['donut', 'pie'],
    'cat-interval'         : ['area-step', 'step', 'bar', 'area', 'area-spline', 'spline', 'line'],
    'cat-ordinal'          : ['bar', 'area', 'area-spline', 'spline', 'line', 'step', 'area-step'],
    'chronological'        : ['area', 'area-spline', 'spline', 'line', 'bar', 'step', 'area-step'],
    'cat-chronological'    : ['line', 'spline', 'area', 'area-spline', 'bar', 'step', 'area-step']
    // 'nominal'           : [],
    // 'extraction'        : []
  };

  var charts = {};
  each(['gauge', 'donut', 'pie', 'bar', 'area', 'area-spline', 'spline', 'line', 'step', 'area-step'], function(type, index){
    charts[type] = {
      render: function(){
        var setup = getSetupTemplate.call(this, type);
        this.view._artifacts['c3'] = c3.generate(setup);
        this.update();
      },
      update: function(){
        var self = this, cols = [];
        if (type === 'gauge') {
          self.view._artifacts['c3'].load({
            columns: [ [self.title(), self.data()[1][1]] ]
          })
        }
        else if (type === 'pie' || type === 'donut') {
          self.view._artifacts['c3'].load({
            columns: self.dataset.data.output.slice(1)
          });
        }
        else {
          if (this.dataType().indexOf('chron') > -1) {
            cols.push(self.dataset.selectColumn(0));
            cols[0][0] = 'x';
          }

          each(self.data()[0], function(c, i){
            if (i > 0) {
              cols.push(self.dataset.selectColumn(i));
            }
          });

          if (self.stacked()) {
            self.view._artifacts['c3'].groups([self.labels()]);
          }

          self.view._artifacts['c3'].load({
            columns: cols
          });
        }
      },
      destroy: function(){
        _selfDestruct.call(this);
      }
    };
  });

  function _selfDestruct(){
    if (this.view._artifacts['c3']) {
      this.view._artifacts['c3'].destroy();
      this.view._artifacts['c3'] = null;
    }
  }

  // Register library + add dependencies + types
  // -------------------------------
  Dataviz.register('c3', charts, { capabilities: dataTypes });

};
